import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category, CategoryDocument } from './category.schema';

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
  ) {}

  async create(categoryData: Partial<Category>): Promise<Category> {
    const category = await this.categoryModel.create(categoryData);
    return category;
  }

  async findAll(): Promise<Category[]> {
    return this.categoryModel.find().exec();
  }

  async findById(id: string): Promise<Category> {
    const category = await this.categoryModel.findById(id).exec();
    if (!category) throw new NotFoundException('Category not found');
    return category;
  }

  async update(id: string, update: Partial<Category>): Promise<Category> {
    const category = await this.categoryModel.findByIdAndUpdate(id, update, { new: true }).exec();
    if (!category) throw new NotFoundException('Category not found');
    
    return category;
  }

  async delete(id: string): Promise<void> {
    const res = await this.categoryModel.findByIdAndDelete(id).exec();
    if (!res) throw new NotFoundException('Category not found');
  }
}
