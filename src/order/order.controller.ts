import { Controller, Get, Post, Body, Param, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { AuthGuard } from '../guard/auth.guard';
import type { RequestWithUser } from '../interface/request.interface';

@ApiTags('Order')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo đơn hàng mới' })
  @ApiResponse({ status: 201, description: 'Đơn hàng đã được tạo thành công.' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ hoặc sản phẩm đã hết hàng.' })
  create(@Req() req: RequestWithUser, @Body() createOrderDto: CreateOrderDto) {
    return this.orderService.create(req.user.id, createOrderDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy lịch sử đơn hàng của người dùng hiện tại' })
  @ApiResponse({ status: 200, description: 'Danh sách lịch sử mua hàng.' })
  findAll(@Req() req: RequestWithUser) {
    return this.orderService.findAllByUser(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Xem chi tiết một đơn hàng cụ thể' })
  @ApiResponse({ status: 200, description: 'Thông tin chi tiết đơn hàng.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy đơn hàng.' })
  findOne(@Req() req: RequestWithUser, @Param('id') id: string) {
    return this.orderService.findOne(id, req.user.id);
  }
}
