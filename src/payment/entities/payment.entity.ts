// payment.entity.ts
import { Order } from '../../order/entities/order.entity';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';

export enum PaymentStatus {
    PENDING = 'PENDING',       // Vừa tạo session
    SUCCESS = 'SUCCESS',       // Thanh toán thành công
    FAILED = 'FAILED',         // Thanh toán thất bại
    EXPIRED = 'EXPIRED',       // Hết hạn
    REFUNDED = 'REFUNDED',     // Đã hoàn tiền
}

export enum PaymentProvider {
    STRIPE = 'STRIPE',
    VNPAY = 'VNPAY',
    MOMO = 'MOMO',
}

@Entity('payments')
export class Payment {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    // Liên kết với Order
    @Column()
    orderId: string;

    @ManyToOne(() => Order)
    @JoinColumn({ name: 'orderId' })
    order: Order;

    // Thông tin payment provider
    @Column({ type: 'enum', enum: PaymentProvider })
    provider: PaymentProvider;          // STRIPE, VNPAY, MOMO

    @Column({ nullable: true })
    providerSessionId: string;          // Stripe session id, VNPay txnRef...

    @Column({ nullable: true })
    providerTransactionId: string;      // ID giao dịch thực tế từ provider

    // Số tiền
    @Column('decimal', { precision: 15, scale: 2 })
    amount: number;

    @Column({ length: 10, default: 'VND' })
    currency: string;

    // Trạng thái
    @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING })
    status: PaymentStatus;

    // URL
    @Column({ nullable: true, length: 500 })
    checkoutUrl: string;                // URL redirect sang trang thanh toán

    @Column({ nullable: true, length: 500 })
    callbackUrl: string;                // URL Stripe/VNPay gọi về (webhook)

    @Column({ nullable: true, length: 500 })
    successUrl: string;                 // URL redirect sau khi thành công

    @Column({ nullable: true, length: 500 })
    cancelUrl: string;                  // URL redirect sau khi huỷ

    // Log raw data từ provider để debug
    @Column({ type: 'jsonb', nullable: true })
    providerRequest: Record<string, any>;   // Data gửi lên provider

    @Column({ type: 'jsonb', nullable: true })
    providerResponse: Record<string, any>;  // Response từ provider

    @Column({ type: 'jsonb', nullable: true })
    webhookPayload: Record<string, any>;    // Raw webhook payload

    // Thông tin lỗi
    @Column({ nullable: true })
    failureCode: string;                // Mã lỗi từ provider

    @Column({ nullable: true })
    failureMessage: string;             // Mô tả lỗi

    // Timestamps
    @Column({ nullable: true })
    paidAt: Date;                       // Thời điểm thanh toán thành công

    @Column({ nullable: true })
    expiredAt: Date;                    // Thời điểm hết hạn

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}