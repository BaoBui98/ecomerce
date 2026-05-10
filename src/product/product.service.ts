import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { ProductRepository } from './product.repository';
import { HelperService } from '../services/helper.service';

@Injectable()
export class ProductService {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly helperService: HelperService,
  ) {}

  /**
   * Tạo sản phẩm mới và tự động tạo slug từ name + timestamp
   */
  async create(createProductDto: CreateProductDto): Promise<Product> {
    const slug = `${this.helperService.slugify(createProductDto.name)}-${Date.now()}`;
    return this.productRepository.createProduct(createProductDto, slug);
  }

  /**
   * Lấy danh sách tất cả sản phẩm
   */
  async findAll(): Promise<Product[]> {
    return this.productRepository.findAll();
  }

  /**
   * Lấy thông tin chi tiết một sản phẩm
   */
  async findOne(id: string): Promise<Product> {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new NotFoundException(`Sản phẩm với ID ${id} không tồn tại`);
    }
    return product;
  }

  /**
   * Cập nhật thông tin sản phẩm và tự động làm mới slug nếu đổi tên
   */
  async update(id: string, updateProductDto: UpdateProductDto): Promise<Product> {
    const product = await this.findOne(id);

    if (updateProductDto.name && updateProductDto.name !== product.name) {
      product.slug = `${this.helperService.slugify(updateProductDto.name)}-${Date.now()}`;
    }

    return this.productRepository.updateProduct(product, updateProductDto);
  }

  /**
   * Xóa sản phẩm
   */
  async remove(id: string): Promise<void> {
    const product = await this.findOne(id);
    await this.productRepository.removeProduct(product);
  }
}
