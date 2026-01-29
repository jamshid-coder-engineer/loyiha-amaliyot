import { Module } from '@nestjs/common';
// import { AppService } from './app.service';
// import { AppController } from './app.controller';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({

      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        migrationsRun: true,
        migrations: ['dist/migrations/*.js'],

        type: 'postgres',
        url: config.get('DB_URL'),
        autoLoadEntities: true,
        synchronize: false
      }),
    }),

    UserModule,
    AuthModule,
    HealthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
