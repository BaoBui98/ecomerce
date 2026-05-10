import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { Product } from '../product/entities/product.entity';
import { AuthModule } from '../auth/auth.module';
import { BullModule } from '@nestjs/bull';
import { OrderExpirationProcessor } from 'src/processor/order-expiration.processor';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem, Product]),
    AuthModule,
    BullModule.registerQueue({
      name: 'order-expiration', //Tên queue để import vào service
    }),
  ],
  controllers: [OrderController],
  providers: [OrderService, OrderExpirationProcessor],
})
export class OrderModule { }
