import { Module } from '@nestjs/common';
import { RedisModule } from 'src/redis/redis.module';

@Module({})
export class SessionModule {
  imports: [RedisModule];
}
