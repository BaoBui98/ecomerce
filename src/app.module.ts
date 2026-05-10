import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { typeOrmConfig } from './config/typeorm.config';
import { ProductModule } from './product/product.module';
import { OrderModule } from './order/order.module';
import { BullModule } from '@nestjs/bull';
import { PaymentModule } from './payment/payment.module';

import { bullRootConfig } from './config/bulk.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    BullModule.forRootAsync(bullRootConfig),
    TypeOrmModule.forRootAsync(typeOrmConfig),
    AuthModule,
    UserModule,
    ProductModule,
    OrderModule,
    PaymentModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
