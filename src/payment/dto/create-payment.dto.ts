import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreatePaymentDto {
    @ApiProperty({
        description: 'ID của đơn hàng cần thanh toán',
        example: 'uuid-of-order'
    })
    @IsNotEmpty({ message: 'orderId không được để trống' })
    @IsString({ message: 'orderId phải là chuỗi' })
    orderId: string;
}
