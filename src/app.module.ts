import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { HealthModule } from './health/health.module';

import { RedisModule } from './redis/redis.module';
import { RedisService } from './redis/redis.service';
import { RedisThrottlerStorage } from './throttler/redis-throttler.storage';

@Module({
  imports: [
    // 1) Global Config
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule, RedisModule],
      inject: [ConfigService, RedisService],
      useFactory: (_config: ConfigService, redisService: RedisService) => ({
        // DIQQAT: NestJS 11 da 'throttlers' massiv bo'lishi shart
        throttlers: [
          {
            name: 'default', // nom berish ixtiyoriy lekin tavsiya etiladi
            ttl: 60000,      // 60 sekund (millisekundda)
            limit: 60,       // so'rovlar soni
          },
        ],
        storage: new RedisThrottlerStorage(redisService.getClient()),
      }),
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        type: 'postgres',
        url: config.get('DB_URL'),
        entities: ['dist/**/*.entity.js'],
        synchronize: true,
      }),
    }),
    RedisModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
