import * as crypto from 'crypto';

import { Inject, Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';
import * as bcrypt from 'bcrypt';

const TTL_SECONDS = 1 * 24 * 60 * 60;

@Injectable()
export class refreshTokensService {
  constructor(@Inject('REDIS') private readonly redis: Redis) {}
  private generateRefreshToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  async issue(userId: number) {
    const tokenId = crypto.randomUUID();
    const rawSecret = this.generateRefreshToken();
    const rawToken = `${tokenId}.${rawSecret}`;
    const secretHash = await bcrypt.hash(rawSecret, 10);
    const key = `refresh:${tokenId}`;
    await this.redis.set(
      key,
      JSON.stringify({ userId, hash: secretHash, ex: TTL_SECONDS }),
      'EX',
      TTL_SECONDS,
    );
    return { refreshToken: rawToken };
  }

  async rotate(rawToken: string) {
    const [tokenId, secret] = rawToken.split('.');
    if (!tokenId || !secret) return null;
    const key = `refresh:${tokenId}`;
    const data = await this.redis.get(key);
    if (!data) return null;

    const parsed = JSON.parse(data) as { userId: number; hash: string; exp: string };

    const match = await bcrypt.compare(secret, parsed.hash);
    if (!match) {
      // await this.revokeAll(parsed.userId);
      return null;
    }

    await this.redis.del(key);
    const { refreshToken: newRefresh } = await this.issue(parsed.userId);

    return { userId: parsed.userId, newRefresh };
  }

  async revoke(userId: number, tokenId: string) {
    const tokenKey = `refresh:${userId}:${tokenId}`;
    await this.redis.del(tokenKey);
    await this.redis.srem(`sessions:${userId}`, tokenKey);
  }
  // async revokeAll(userId: number) {
  //   let cursor = '0';
  //   const toDelete: string[] = [];

  //   do {
  //     const [next, keys] = await this.redis.scan(cursor, 'MATCH', 'rt:*', 'COUNT', 100);
  //     cursor = next;

  //     if (keys.length) {
  //       const values = await this.redis.mget(...keys);
  //       values.forEach((v, i) => {
  //         if (!v) return;
  //         try {
  //           const parsed = JSON.parse(v) as TokenData;
  //           if (parsed.userId === userId) {
  //             toDelete.push(keys[i]);
  //           }
  //         } catch {
  //           // Skip invalid JSON
  //         }
  //       });
  //     }
  //   } while (cursor !== '0');

  //   if (toDelete.length) {
  //     await this.redis.del(...toDelete);
  //   }
  // }

  async validate(rawToken: string): Promise<{ userId: number } | null> {
    const [tokenId, secret] = rawToken.split('.');
    if (!tokenId || !secret) return null;

    const tokenKey = `refresh:${tokenId}`;
    const data = await this.redis.get(tokenKey);
    if (!data) return null;

    const { userId, hash } = JSON.parse(data) as { userId: number; hash: string; exp: string };
    const match = await bcrypt.compare(secret, hash);
    if (!match) return null;

    return { userId };
  }
}
