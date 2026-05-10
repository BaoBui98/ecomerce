// order-expiration.processor.ts
import { Processor, Process, OnQueueFailed } from '@nestjs/bull';
import type { Job } from 'bull';
import { DataSource } from 'typeorm';
import { Order, OrderStatus } from '../order/entities/order.entity';
import { OrderItem } from '../order/entities/order-item.entity';
import { Product } from '../product/entities/product.entity';

@Processor('order-expiration')
export class OrderExpirationProcessor {
    constructor(private dataSource: DataSource) { }

    @Process('cancel-order')
    async handleCancelOrder(job: Job<{ orderId: string }>) {
        const { orderId } = job.data;

        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            // 1. Lấy order và lock
            const order = await queryRunner.manager
                .createQueryBuilder(Order, 'o')
                .where('o.id = :orderId', { orderId })
                .setLock('pessimistic_write')
                .getOne();

            // Không tìm thấy order
            if (!order) return;

            // Order đã được thanh toán hoặc huỷ trước đó → bỏ qua
            if (order.status !== OrderStatus.PENDING) return;

            // 2. Lấy items để hoàn trả stock
            const orderItems = await queryRunner.manager.find(OrderItem, {
                where: { orderId },
            });

            // 3. Hoàn trả stock
            await Promise.all(
                orderItems.map(item =>
                    queryRunner.manager
                        .createQueryBuilder()
                        .update(Product)
                        .set({ stock: () => `stock + ${item.quantity}` })
                        .where('id = :id', { id: item.productId })
                        .execute()
                )
            );

            // 4. Cập nhật status → CANCELLED
            await queryRunner.manager.update(Order, orderId, {
                status: OrderStatus.CANCELLED,
            });

            await queryRunner.commitTransaction();

        } catch (err) {
            await queryRunner.rollbackTransaction();
            throw err; // throw để Bull retry
        } finally {
            await queryRunner.release();
        }
    }

    // Log khi job fail hết số lần retry
    @OnQueueFailed()
    onFailed(job: Job, err: Error) {
        console.error(`Job ${job.id} failed after ${job.attemptsMade} attempts`, err);
        // Có thể gửi alert Slack, email ở đây
    }
}