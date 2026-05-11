import { Controller, Post, Body, UseGuards, Req, Headers } from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { AuthGuard } from '../guard/auth.guard';
import type { RequestWithUser } from '../interface/request.interface';
import type { Request } from 'express';

@ApiTags('Payment')
@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) { }

  @Post('checkout')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Tạo checkout session cho thanh toán Stripe' })
  @ApiResponse({ status: 201, description: 'Tạo thành công link thanh toán.' })
  async createCheckout(
    @Req() req: RequestWithUser,
    @Body() createPaymentDto: CreatePaymentDto,
  ) {
    return this.paymentService.createCheckoutSession(req.user.id, createPaymentDto);
  }

  @Post('webhook')
  @ApiOperation({ summary: 'Webhook từ Stripe báo về kết quả thanh toán' })
  async handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    // Ở đây req.rawBody đã được cấu hình enable ở main.ts
    return this.paymentService.handleWebhook(req.rawBody || Buffer.from(''), signature);
  }
}
