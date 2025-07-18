import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from './product.schema';

interface FindAllOptions {
  featured?: boolean;
  sort?: string;
  limit?: number;
  page?: number;
}

@Injectable()
export class ProductService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  async create(productData: Partial<Product>): Promise<Product> {
    return this.productModel.create(productData);
  }

  async findAll(options: FindAllOptions = {}): Promise<any> {
    let query = this.productModel.find().populate('category', 'name');

    // Filter by featured
    if (options.featured !== undefined) {
      query = query.where('isFeatured').equals(options.featured);
    }

    // Apply sorting
    if (options.sort) {
      switch (options.sort) {
        case 'newest':
          query = query.sort({ createdAt: -1 });
          break;
        case 'popular':
          query = query.sort({ isFeatured: -1, price: -1 });
          break;
        case 'price-low':
          query = query.sort({ price: 1 });
          break;
        case 'price-high':
          query = query.sort({ price: -1 });
          break;
        default:
          query = query.sort({ createdAt: -1 });
      }
    } else {
      query = query.sort({ createdAt: -1 });
    }

    // Handle pagination
    if (options.page && options.limit) {
      const skip = (options.page - 1) * options.limit;
      query = query.skip(skip).limit(options.limit);
      
      // Get total count for pagination
      const totalCount = await this.productModel.countDocuments(
        options.featured !== undefined ? { isFeatured: options.featured } : {}
      );
      
      const products = await query.exec();
      const totalPages = Math.ceil(totalCount / options.limit);
      
      return {
        products,
        totalPages,
        currentPage: options.page,
        totalCount,
        hasNextPage: options.page < totalPages,
        hasPrevPage: options.page > 1
      };
    } else if (options.limit) {
      // Just limit without pagination
      if (options.limit >= 1000) {
        // If limit is very high (like 1000), return all products instead
        const products = await this.productModel.find({}).populate('category', 'name').sort({ createdAt: -1 }).exec();
        return products;
      }
      
      query = query.limit(options.limit);
      const products = await query.exec();
      return products;
    } else {
      // No pagination, return all products
      const products = await this.productModel.find({}).populate('category', 'name').sort({ createdAt: -1 }).exec();
      return products;
    }
  }

  async findById(id: string): Promise<Product> {
    const product = await this.productModel.findById(id).exec();
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async findByIds(ids: string[]): Promise<Product[]> {
    const products = await this.productModel
      .find({ _id: { $in: ids } })
      .populate('category', 'name')
      .exec();
    return products;
  }

  async update(id: string, update: Partial<Product>): Promise<Product> {
    const product = await this.productModel.findByIdAndUpdate(
      id, 
      { $set: update }, 
      { new: true, runValidators: false }
    ).exec();
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async delete(id: string): Promise<void> {
    const res = await this.productModel.findByIdAndDelete(id).exec();
    if (!res) throw new NotFoundException('Product not found');
  }
  
  async pushImage(id: string, imagePath: string) {
    return this.productModel.findByIdAndUpdate(id, { $push: { images: imagePath } }, { new: true }).exec();
  }

  async clearAllProducts(): Promise<void> {
    await this.productModel.deleteMany({});
  }

  async getTotalCount(): Promise<number> {
    const count = await this.productModel.countDocuments({});
    return count;
  }

  async updateStock(productId: string, quantityChange: number): Promise<Product> {
    const product = await this.productModel.findByIdAndUpdate(
      productId,
      { $inc: { stockQuantity: quantityChange } },
      { new: true }
    ).exec();
    
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

}
