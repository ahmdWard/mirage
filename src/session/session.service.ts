import * as crypto from 'crypto';
import { Inject, Injectable, Logger } from '@nestjs/common';
import Redis from 'ioredis';
import * as bcrypt from 'bcrypt';
import { SessionData } from './interface/sessionData.interface';
import { SessionMetadata } from './interface/SessionMetadata.interface';

@Injectable()
export class SessionService {
  private readonly logger = new Logger(SessionService.name);
  private readonly TOKEN_LENGTH = 32;
  private readonly BCRYPT_ROUNDS = 12;
  private readonly MAX_ROTATION_COUNT = 10;
  private readonly KEY_PREFIX = 'refresh';

  constructor(@Inject('REDIS') private readonly redis: Redis) {}

  private generateRefreshToken(): string {
    return crypto.randomBytes(this.TOKEN_LENGTH).toString('hex');
  }

  private getSessionKey(userId: number, deviceId: string): string {
    return `${this.KEY_PREFIX}:${userId}:${deviceId}`;
  }

  async issue(
    userId: number,
    deviceId: string,
    metadata: SessionMetadata,
    ttlSeconds: number = 2592000,
  ): Promise<{ refreshToken: string } | null> {
    try {
      const tokenId = crypto.randomUUID();
      const rawSecret = this.generateRefreshToken();
      const rawToken = `${tokenId}.${rawSecret}`;

      const hash = await bcrypt.hash(rawToken, this.BCRYPT_ROUNDS);

      const key = this.getSessionKey(userId, deviceId);
      const sessionData: SessionData = {
        tokenId,
        hash,
        ip: metadata.ip,
        browser: metadata.browser,
        os: metadata.os,
        createdAt: Date.now(),
        rotationCount: 0,
      };

      await this.redis.set(key, JSON.stringify(sessionData), 'EX', ttlSeconds);

      this.logger.log(`Session issued for user ${userId}, device ${deviceId}`);
      return { refreshToken: rawToken };
    } catch (error) {
      this.logger.error(`Failed to issue session: ${error}`);
      return null;
    }
  }

  async validate(userId: number, deviceId: string, rawToken: string): Promise<boolean> {
    try {
      const [tokenId, secret] = rawToken.split('.');
      if (!tokenId || !secret) {
        this.logger.warn(`Invalid token format for user ${userId}`);
        return false;
      }

      const key = this.getSessionKey(userId, deviceId);
      const data = await this.redis.get(key);

      if (!data) {
        this.logger.warn(`Session not found for user ${userId}, device ${deviceId}`);
        return false;
      }

      const parsed = JSON.parse(data) as SessionData;

      if (parsed.tokenId !== tokenId) {
        this.logger.warn(`Token ID mismatch for user ${userId}`);
        return false;
      }

      const match = await bcrypt.compare(secret, parsed.hash);

      if (!match) {
        this.logger.warn(`Token validation failed for user ${userId}`);
        return false;
      }

      parsed.lastUsedAt = Date.now();
      const ttl = await this.redis.ttl(key);
      if (ttl > 0) {
        await this.redis.set(key, JSON.stringify(parsed), 'EX', ttl);
      }

      return true;
    } catch (error) {
      this.logger.error(`Validation error: ${error}`);
      return false;
    }
  }

  async revokeDevice(userId: number, deviceId: string): Promise<boolean> {
    try {
      const key = this.getSessionKey(userId, deviceId);
      const result = await this.redis.del(key);

      if (result > 0) {
        this.logger.log(`Session revoked for user ${userId}, device ${deviceId}`);
        return true;
      }

      return false;
    } catch (error) {
      this.logger.error(`Failed to revoke session: ${error}`);
      return false;
    }
  }

  async revokeAllUserSessions(userId: number): Promise<number> {
    try {
      const pattern = `${this.KEY_PREFIX}:${userId}:*`;
      const keys = await this.redis.keys(pattern);

      if (keys.length === 0) {
        return 0;
      }

      const result = await this.redis.del(...keys);
      this.logger.log(`Revoked ${result} sessions for user ${userId}`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to revoke all sessions: ${error}`);
      return 0;
    }
  }

  async rotate(
    userId: number,
    deviceId: string,
    rawToken: string,
    ttlSeconds: number = 2592000,
  ): Promise<{ refreshToken: string } | null> {
    try {
      const [tokenId, secret] = rawToken.split('.');
      if (!tokenId || !secret) {
        this.logger.warn(`Invalid token format for rotation`);
        return null;
      }

      const key = this.getSessionKey(userId, deviceId);
      const data = await this.redis.get(key);

      if (!data) {
        this.logger.warn(`Session not found for rotation`);
        return null;
      }

      const parsed = JSON.parse(data) as SessionData;

      if (parsed.tokenId !== tokenId) {
        this.logger.warn(`Token ID mismatch during rotation`);
        return null;
      }

      const match = await bcrypt.compare(secret, parsed.hash);
      if (!match) {
        this.logger.warn(`Token validation failed during rotation`);
        return null;
      }

      // Check rotation count to prevent abuse
      const rotationCount = (parsed.rotationCount || 0) + 1;
      if (rotationCount > this.MAX_ROTATION_COUNT) {
        this.logger.warn(`Max rotation count exceeded for user ${userId}, device ${deviceId}`);
        await this.redis.del(key);
        return null;
      }

      // Delete old token
      await this.redis.del(key);

      // Issue new token with preserved metadata
      const metadata: SessionMetadata = {
        ip: parsed.ip,
        browser: parsed.browser,
        os: parsed.os,
      };

      const newSession = await this.issue(userId, deviceId, metadata, ttlSeconds);

      if (newSession) {
        const newKey = this.getSessionKey(userId, deviceId);
        const newData = await this.redis.get(newKey);
        if (newData) {
          const newParsed = JSON.parse(newData) as SessionData;
          newParsed.rotationCount = rotationCount;
          const newTtl = await this.redis.ttl(newKey);
          await this.redis.set(newKey, JSON.stringify(newParsed), 'EX', newTtl);
        }

        this.logger.log(`Token rotated for user ${userId}, device ${deviceId}`);
      }

      return newSession;
    } catch (error) {
      this.logger.error(`Rotation failed: ${error}`, error);
      return null;
    }
  }

  async getUserSessions(userId: number): Promise<SessionData[]> {
    try {
      const pattern = `${this.KEY_PREFIX}:${userId}:*`;
      const keys = await this.redis.keys(pattern);

      if (keys.length === 0) {
        return [];
      }

      const sessions: SessionData[] = [];
      for (const key of keys) {
        const data = await this.redis.get(key);
        if (data) {
          const parsed = JSON.parse(data) as SessionData;
          parsed.hash = '';
          sessions.push(parsed);
        }
      }

      return sessions;
    } catch (error) {
      this.logger.error(`Failed to get user sessions: ${error}`);
      return [];
    }
  }

  async getSessionTTL(userId: number, deviceId: string): Promise<number> {
    try {
      const key = this.getSessionKey(userId, deviceId);
      return await this.redis.ttl(key);
    } catch (error) {
      this.logger.error(`Failed to get session TTL: ${error}`);
      return -1;
    }
  }

  async extendSession(
    userId: number,
    deviceId: string,
    additionalSeconds: number,
  ): Promise<boolean> {
    try {
      const key = this.getSessionKey(userId, deviceId);
      const currentTTL = await this.redis.ttl(key);

      if (currentTTL <= 0) {
        return false;
      }

      const newTTL = currentTTL + additionalSeconds;
      await this.redis.expire(key, newTTL);

      this.logger.log(`Session extended for user ${userId}, device ${deviceId}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to extend session: ${error}`);
      return false;
    }
  }
}
