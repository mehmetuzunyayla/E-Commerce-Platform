import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Order, OrderDocument } from './order.schema';
import { ProductService } from '../product/product.service';

@Injectable()
export class OrderService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    private productService: ProductService,
  ) {}

  async create(orderData: Partial<Order>): Promise<Order> {
    // Create the order
    const order = await this.orderModel.create(orderData);
    
    // Update stock for each product in the order
    if (orderData.items) {
      for (const item of orderData.items) {
        await this.productService.updateStock(item.product.toString(), -item.quantity);
      }
    }
    
    return order;
  }

  async findAll(): Promise<Order[]> {
    return this.orderModel.find()
      .populate('items.product', 'name price stockQuantity images')
      .populate('user', 'email fullName')
      .exec();
  }

  async findById(id: string): Promise<Order> {
    const order = await this.orderModel.findById(id)
      .populate('items.product', 'name price stockQuantity images')
      .exec();
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async findByUser(userId: string): Promise<Order[]> {
    // Convert userId to ObjectId for proper querying
    const userObjectId = new Types.ObjectId(userId);
    return this.orderModel.find({ user: userObjectId })
      .populate('items.product', 'name price stockQuantity images')
      .exec();
  }

  async findByGuestEmail(email: string): Promise<Order[]> {
    return this.orderModel.find({ 'guestInfo.email': email })
      .populate('items.product', 'name price stockQuantity images')
      .exec();
  }


  async updateStatus(id: string, status: string): Promise<Order> {
    const order = await this.orderModel.findByIdAndUpdate(id, { status }, { new: true })
      .populate('items.product', 'name price stockQuantity images')
      .populate('user', 'email fullName')
      .exec();
    
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async delete(id: string): Promise<void> {
    const res = await this.orderModel.findByIdAndDelete(id).exec();
    if (!res) throw new NotFoundException('Order not found');
  }
}
