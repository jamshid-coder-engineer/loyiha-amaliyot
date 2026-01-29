import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

const isProd = process.env.NODE_ENV === 'production';

export default new DataSource({
  type: 'postgres',
  url: process.env.DB_URL,

  entities: isProd
    ? ['dist/**/*.entity.js']
    : ['src/**/*.entity.ts'],

  migrations: isProd
    ? ['dist/migrations/*.js']
    : ['migrations/*.ts'],

  migrationsRun: true,
});
