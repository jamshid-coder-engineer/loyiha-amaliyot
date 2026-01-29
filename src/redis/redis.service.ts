import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: Redis;
  private readonly logger = new Logger(RedisService.name);

  constructor() {
    this.initClient();
  }

  onModuleInit() {
    this.initClient();
  }

  private initClient() {
    if (this.client) return;
    const host = process.env.REDIS_HOST || '127.0.0.1';
    const port = Number(process.env.REDIS_PORT || 6379);

    this.client = new Redis({ host, port });

    this.client.on('connect', () => this.logger.log(`Redis connected: ${host}:${port}`));
    this.client.on('error', (err) => this.logger.error(`Redis error: ${err.message}`));
  }

  onModuleDestroy() {
    return this.client?.quit();
  }

  getClient() {
    this.initClient();
    return this.client;
  }

  async getJson<T>(key: string): Promise<T | null> {
    const raw = await this.client.get(key);
    return raw ? (JSON.parse(raw) as T) : null;
  }

  async setJson(key: string, value: unknown, ttlSeconds = 30) {
    await this.client.set(key, JSON.stringify(value), 'EX', ttlSeconds);
  }

  async delByPattern(pattern: string) {
    // KEYS dev uchun ok, prod’da SCAN qilamiz (3-hafta oxirida)
    const keys = await this.client.keys(pattern);
    if (keys.length) await this.client.del(keys);
  }
}
