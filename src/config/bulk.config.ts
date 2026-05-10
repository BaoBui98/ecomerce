import { SharedBullAsyncConfiguration, BullRootModuleOptions } from '@nestjs/bull';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVariables } from '../common/enviroment.common';

export const bullRootConfig: SharedBullAsyncConfiguration = {
  inject: [ConfigService],
  useFactory: (configService: ConfigService): BullRootModuleOptions => {
    const env = new EnvironmentVariables(configService);
    return {
      redis: {
        host: env.REDIS_HOST,
        port: env.REDIS_PORT,
      },
    };
  },
};
