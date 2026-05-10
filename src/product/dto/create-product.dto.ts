import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsPositive, IsString } from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ example: 'iPhone 15 Pro', description: 'Tên sản phẩm' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Điện thoại thông minh cao cấp từ Apple', description: 'Mô tả sản phẩm' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: 999.99, description: 'Giá bán sản phẩm' })
  @IsNumber()
  @IsPositive()
  price: number;

  @ApiProperty({ example: 100, description: 'Số lượng tồn kho' })
  @IsNumber()
  @IsNotEmpty()
  stock: number;
}
