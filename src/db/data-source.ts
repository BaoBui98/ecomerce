import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVariables } from '../common/enviroment.common';

const configService = new ConfigService();
const env = new EnvironmentVariables(configService);

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: env.DB_HOST,
  port: env.DB_PORT,
  username: env.DB_USERNAME,
  password: env.DB_PASSWORD,
  database: env.DB_DATABASE,
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/../migrations/*{.ts,.js}'],
  synchronize: false,
});
