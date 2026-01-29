import type { ThrottlerStorage } from '@nestjs/throttler';
import type Redis from 'ioredis';

type ThrottlerStorageRecord = {
  totalHits: number;
  timeToExpire: number;
  isBlocked: boolean;
  timeToBlockExpire: number;
};

export class RedisThrottlerStorage implements ThrottlerStorage {
  constructor(private readonly redis: Redis) {}

  async increment(
    key: string,
    ttl: number,
    limit: number,
    blockDuration: number,
    throttlerName: string,
  ): Promise<ThrottlerStorageRecord> {
    const base = `rate:${throttlerName}:${key}`;
    const countKey = `${base}:count`;
    const blockKey = `${base}:block`;

    const blockTtl = await this.redis.ttl(blockKey);
    if (blockTtl > 0) {
      return {
        totalHits: limit,
        timeToExpire: 0,
        isBlocked: true,
        timeToBlockExpire: blockTtl,
      };
    }

    const res = await this.redis.multi().incr(countKey).ttl(countKey).exec();

    const totalHits = Number(res?.[0]?.[1] ?? 0);
    let timeToExpire = Number(res?.[1]?.[1] ?? -1);

    if (totalHits === 1 || timeToExpire === -1) {
      await this.redis.expire(countKey, ttl);
      timeToExpire = ttl;
    }

    if (totalHits > limit) {
      await this.redis.set(blockKey, '1', 'EX', blockDuration);

      return {
        totalHits,
        timeToExpire,
        isBlocked: true,
        timeToBlockExpire: blockDuration,
      };
    }

    return {
      totalHits,
      timeToExpire,
      isBlocked: false,
      timeToBlockExpire: 0,
    };
  }
}
