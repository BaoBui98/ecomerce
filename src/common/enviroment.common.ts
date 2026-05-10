import { ConfigService } from '@nestjs/config';
import { IsNotEmpty, IsNumber, IsString, validateSync } from 'class-validator';

export class EnvironmentVariables {
  @IsString()
  @IsNotEmpty()
  DB_HOST: string;

  @IsNumber()
  DB_PORT: number;

  @IsString()
  @IsNotEmpty()
  DB_USERNAME: string;

  @IsString()
  @IsNotEmpty()
  DB_PASSWORD: string;

  @IsString()
  @IsNotEmpty()
  DB_DATABASE: string;

  @IsString()
  @IsNotEmpty()
  JWT_ACCESS_SECRET: string;

  @IsString()
  @IsNotEmpty()
  JWT_REFRESH_SECRET: string;

  @IsString()
  @IsNotEmpty()
  JWT_ACCESS_EXPIRES_IN: string;

  @IsString()
  @IsNotEmpty()
  JWT_REFRESH_EXPIRES_IN: string;

  @IsString()
  @IsNotEmpty()
  REDIS_HOST: string;

  @IsNumber()
  REDIS_PORT: number;

  constructor(configService: ConfigService) {
    this.DB_HOST = configService.get<string>('DB_HOST', 'localhost');
    this.DB_PORT = parseInt(configService.get<string>('DB_PORT', '5432'), 10);
    this.DB_USERNAME = configService.get<string>('DB_USERNAME', 'admin');
    this.DB_PASSWORD = configService.get<string>('DB_PASSWORD', 'admin123');
    this.DB_DATABASE = configService.get<string>('DB_DATABASE', 'app_db');

    this.JWT_ACCESS_SECRET = configService.get<string>('JWT_ACCESS_SECRET', 'access_secret_key_123');
    this.JWT_REFRESH_SECRET = configService.get<string>('JWT_REFRESH_SECRET', 'refresh_secret_key_123');
    this.JWT_ACCESS_EXPIRES_IN = configService.get<string>('JWT_ACCESS_EXPIRES_IN', '15m');
    this.JWT_REFRESH_EXPIRES_IN = configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d');

    this.REDIS_HOST = configService.get<string>('REDIS_HOST', 'localhost');
    this.REDIS_PORT = parseInt(configService.get<string>('REDIS_PORT', '6379'), 10);

    // Tự động xác thực các biến môi trường ngay khi khởi tạo đối tượng!
    const errors = validateSync(this, { skipMissingProperties: false });
    if (errors.length > 0) {
      throw new Error(`Environment validation failed: ${errors.toString()}`);
    }
  }
}
