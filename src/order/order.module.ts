import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { Product } from '../product/entities/product.entity';
import { AuthModule } from '../auth/auth.module';
import { BullModule } from '@nestjs/bull';
import { OrderExpirationProcessor } from '../processor/order-expiration.processor';

import { QUEUE_NAMES } from '../common/queue.common';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem, Product]),
    AuthModule,
    BullModule.registerQueue({
      name: QUEUE_NAMES.ORDER_EXPIRATION,
    }),
  ],
  controllers: [OrderController],
  providers: [OrderService, OrderExpirationProcessor],
  exports: [OrderService],
})
export class OrderModule { }
