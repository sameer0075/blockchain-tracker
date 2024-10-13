import { DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';
import { Logger } from '@nestjs/common';
dotenv.config();

console.log('process.env.DATABASE_UR', process.env.DATABASE_URL);
const databaseConfig: DataSourceOptions = {
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: ['dist/**/*.entity{.js,.ts}'],
  synchronize: false,
  migrations: ['dist/database/*.{ts,js}'],
  logging: true,
  migrationsRun: true,
};

export default databaseConfig;
