import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { Product } from './entities/product.entity';
import { ProductRepository } from './product.repository';
import { HelperService } from '../services/helper.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product]),
    AuthModule,
  ],
  controllers: [ProductController],
  providers: [ProductService, ProductRepository, HelperService],
  exports: [TypeOrmModule, ProductRepository, HelperService],
})
export class ProductModule {}
