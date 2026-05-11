import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { Payment, PaymentProvider, PaymentStatus } from './entities/payment.entity';
import { OrderService } from '../order/order.service';
import { OrderStatus } from '../order/entities/order.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Injectable()
export class PaymentService {
  private stripe: Stripe.Stripe;
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    private readonly configService: ConfigService,
    private readonly orderService: OrderService,
  ) {
    const secretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (!secretKey) {
      this.logger.warn('STRIPE_SECRET_KEY is not defined!');
    }
    this.stripe = new Stripe(secretKey || '');
  }

  async createCheckoutSession(userId: string, createPaymentDto: CreatePaymentDto) {
    const { orderId } = createPaymentDto;

    // 1. Kiểm tra đơn hàng có tồn tại và thuộc về user không
    const order = await this.orderService.findOne(orderId, userId);

    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException(`Đơn hàng đang ở trạng thái ${order.status}, không thể thanh toán.`);
    }

    // 2. Tạo line items cho Stripe
    const lineItems = order.items.map((item) => ({
      price_data: {
        currency: 'vnd',
        product_data: {
          name: item.product.name,
          description: item.product.description,
        },
        unit_amount: Math.round(Number(item.price)), // Stripe nhận số nguyên nhỏ nhất cho từng currency (VND ko có xu nên giữ nguyên)
      },
      quantity: item.quantity,
    }));

    // 3. Khởi tạo record Payment với status PENDING
    const payment = this.paymentRepository.create({
      orderId: order.id,
      amount: order.totalAmount,
      currency: 'VND',
      provider: PaymentProvider.STRIPE,
      status: PaymentStatus.PENDING,
      successUrl: this.configService.get('STRIPE_SUCCESS_URL'),
      cancelUrl: this.configService.get('STRIPE_CANCEL_URL'),
    });

    const savedPayment = await this.paymentRepository.save(payment);

    // 4. Gọi Stripe API tạo session
    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${this.configService.get('STRIPE_SUCCESS_URL')}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: this.configService.get('STRIPE_CANCEL_URL'),
      metadata: {
        orderId: order.id,
        paymentId: savedPayment.id,
      },
    });

    // 5. Cập nhật provider info
    savedPayment.providerSessionId = session.id;
    savedPayment.checkoutUrl = session.url as string;
    savedPayment.providerRequest = {
      line_items: lineItems,
    };
    savedPayment.providerResponse = session;

    await this.paymentRepository.save(savedPayment);

    return {
      checkoutUrl: session.url,
      sessionId: session.id,
    };
  }

  async handleWebhook(rawBody: Buffer, signature: string) {
    const webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET');

    let event;

    try {
      event = this.stripe.webhooks.constructEvent(rawBody, signature, webhookSecret || '');
    } catch (err) {
      this.logger.error(`⚠️  Webhook signature verification failed.`, err.message);
      throw new BadRequestException(`Webhook Error: ${err.message}`);
    }

    this.logger.log(`🔔 Received event: ${event.type}`);

    // Xử lý event checkout hoàn tất
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;

      const { orderId, paymentId } = session.metadata || {};

      if (!orderId || !paymentId) {
        this.logger.warn('Webhook metadata lacks orderId or paymentId', session.metadata);
        return;
      }

      const payment = await this.paymentRepository.findOne({ where: { id: paymentId } });
      if (!payment) {
        this.logger.error(`Payment ${paymentId} not found for checkout session`);
        return;
      }

      if (payment.status === PaymentStatus.SUCCESS) {
        this.logger.log(`Payment ${paymentId} was already processed.`);
        return;
      }

      // Cập nhật trạng thái Payment
      payment.status = PaymentStatus.SUCCESS;
      payment.providerTransactionId = session.payment_intent as string;
      payment.webhookPayload = session as any;
      payment.paidAt = new Date();
      await this.paymentRepository.save(payment);

      // Cập nhật trạng thái Order thông qua OrderService
      try {
        await this.orderService.confirmPayment(orderId);
        this.logger.log(`Successfully confirmed order ${orderId} via Stripe Webhook`);
      } catch (error) {
        this.logger.error(`Failed to confirm order ${orderId} but payment ${paymentId} was successful.`, error);
      }
    }

    return { received: true };
  }
}
