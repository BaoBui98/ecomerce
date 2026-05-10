import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductRepository {
  constructor(
    @InjectRepository(Product)
    private readonly repository: Repository<Product>,
  ) {}

  /**
   * Tạo sản phẩm mới với slug tự sinh
   */
  async createProduct(createProductDto: CreateProductDto, slug: string): Promise<Product> {
    const product = this.repository.create({
      ...createProductDto,
      slug,
    });
    return this.repository.save(product);
  }

  /**
   * Lấy danh sách tất cả sản phẩm
   */
  async findAll(): Promise<Product[]> {
    return this.repository.find();
  }

  /**
   * Tìm sản phẩm bằng ID
   */
  async findById(id: string): Promise<Product | null> {
    return this.repository.findOneBy({ id });
  }

  /**
   * Tìm sản phẩm bằng slug
   */
  async findBySlug(slug: string): Promise<Product | null> {
    return this.repository.findOneBy({ slug });
  }

  /**
   * Cập nhật sản phẩm
   */
  async updateProduct(product: Product, updateProductDto: UpdateProductDto): Promise<Product> {
    Object.assign(product, updateProductDto);
    return this.repository.save(product);
  }

  /**
   * Xóa sản phẩm khỏi database
   */
  async removeProduct(product: Product): Promise<void> {
    await this.repository.remove(product);
  }
}
