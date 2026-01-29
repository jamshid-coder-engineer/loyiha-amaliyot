import { Controller, Get } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { RedisService } from '../redis/redis.service';

@Controller('health')
export class HealthController {
  constructor(
    private dataSource: DataSource,
    private redis: RedisService,
  ) {}

  @Get()
  async check() {
    const db = await this.dataSource.query('SELECT 1 as ok');
    const redisPing = await this.redis.getClient().ping();

    return {
      status: 'ok',
      db: db[0],
      redis: redisPing,
    };
  }
}
