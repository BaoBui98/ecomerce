import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import { CreateOrderDto } from './dto/create-order.dto';
import { Order, OrderStatus } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { Product } from '../product/entities/product.entity';
import type { Queue } from 'bull';

import { InjectQueue } from '@nestjs/bull';
import { QUEUE_NAMES } from '../common/queue.common';

@Injectable()
export class OrderService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectQueue(QUEUE_NAMES.ORDER_EXPIRATION) private orderExpirationQueue: Queue,
  ) { }

  /**
   * Tạo đơn hàng mới với kiểm soát atomic update cho số lượng tồn kho
   */
  async create(userId: string, createOrderDto: CreateOrderDto): Promise<Order> {
    // --- Validate trước transaction ---
    if (!createOrderDto.items?.length) {
      throw new BadRequestException('Đơn hàng phải có ít nhất 1 sản phẩm');
    }
    if (createOrderDto.items.some(i => i.quantity <= 0)) {
      throw new BadRequestException('Số lượng phải lớn hơn 0');
    }
    const productIds = createOrderDto.items.map(i => i.productId);
    if (new Set(productIds).size !== productIds.length) {
      throw new BadRequestException('Có sản phẩm trùng lặp trong đơn');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Lock toàn bộ sản phẩm cần thiết trong 1 câu SQL
      const products = await queryRunner.manager
        .createQueryBuilder(Product, 'p')
        .whereInIds(productIds)
        .setLock('pessimistic_write')
        .getMany();

      const productMap = new Map(products.map(p => [p.id, p]));

      // 2. Kiểm tra tồn tại + đủ hàng trong memory (an toàn vì đã lock)
      for (const { productId, quantity } of createOrderDto.items) {
        const product = productMap.get(productId);
        if (!product) {
          throw new NotFoundException(`Không tìm thấy sản phẩm với ID ${productId}`);
        }
        if (product.stock < quantity) {
          throw new BadRequestException(`"${product.name}" không đủ số lượng yêu cầu`);
        }
        product.stock -= quantity; // cập nhật trong memory
      }

      // 3. Bulk update stock — N Promise.all thay vì N await tuần tự
      await Promise.all(
        products.map(p => queryRunner.manager.update(Product, p.id, { stock: p.stock }))
      );

      // 4. Tính tiền và tạo danh sách OrderItem
      let totalAmount = 0;
      const orderItemsList = createOrderDto.items.map(({ productId, quantity }) => {
        const price = Number(productMap.get(productId)!.price);
        totalAmount += price * quantity;
        return queryRunner.manager.create(OrderItem, { productId, quantity, price });
      });
      const expiredAt = new Date(Date.now() + 15 * 60 * 1000); // 15 phút


      // 5. Lưu Order
      const savedOrder = await queryRunner.manager.save(
        queryRunner.manager.create(Order, {
          userId,
          totalAmount,
          status: OrderStatus.PENDING,
          expiredAt,
        })
      );

      // 6. Bulk insert OrderItem
      const itemsWithOrderId = orderItemsList.map(item => ({
        ...item,
        orderId: savedOrder.id,
      }));
      await queryRunner.manager.insert(OrderItem, itemsWithOrderId);

      await queryRunner.commitTransaction();

      // Thêm job vào queue SAU KHI commit thành công
      await this.orderExpirationQueue.add(
        'cancel-order',
        { orderId: savedOrder.id },
        {
          delay: 15 * 60 * 1000,  // delay 15 phút
          attempts: 3,             // retry 3 lần nếu fail
          backoff: {
            type: 'exponential',
            delay: 5000,           // retry sau 5s, 10s, 20s
          },
          removeOnComplete: true,  // xoá job khi done
          removeOnFail: false,     // giữ lại job fail để debug
        }
      );


      // 7. Trả về từ memory, không cần SELECT thêm
      savedOrder.items = itemsWithOrderId.map(item => ({
        ...item,
        product: productMap.get(item.productId)!,
      }));
      return savedOrder;

    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Xem danh sách lịch sử mua hàng của user hiện tại
   */
  async findAllByUser(userId: string): Promise<Order[]> {
    return this.orderRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      relations: ['items', 'items.product'],
    });
  }

  /**
   * Xem chi tiết 1 đơn hàng
   */
  async findOne(id: string, userId: string): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id, userId },
      relations: ['items', 'items.product'],
    });

    if (!order) {
      throw new NotFoundException('Không tìm thấy thông tin đơn hàng yêu cầu.');
    }

    return order;
  }

  async confirmPayment(orderId: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const order = await queryRunner.manager
        .createQueryBuilder(Order, 'o')
        .where('o.id = :orderId', { orderId })
        .setLock('pessimistic_write') // ← Lock để tránh race với processor
        .getOne();

      if (order?.status !== OrderStatus.PENDING) {
        throw new BadRequestException('Đơn hàng không hợp lệ');
      }

      await queryRunner.manager.update(Order, orderId, {
        status: OrderStatus.PAID,
      });

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}
