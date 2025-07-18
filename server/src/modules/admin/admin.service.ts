import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument } from '../order/order.schema';
import { User, UserDocument } from '../user/user.schema';
import { Product, ProductDocument } from '../product/product.schema';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  async getDashboardStats() {
    const [totalSales, totalOrders, totalCustomers] = await Promise.all([
      this.orderModel.aggregate([
        { $match: { status: { $in: ['delivered'] } } },
        { $group: { _id: null, total: { $sum: '$totalPrice' } } },
      ]),
      this.orderModel.countDocuments(),
      this.userModel.countDocuments({ role: 'customer' }),
    ]);

    return {
      totalSales: totalSales[0]?.total || 0,
      totalOrders: totalOrders,
      totalCustomers: totalCustomers,
    };
  }

  async getSalesData() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const salesData = await this.orderModel.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo },
          status: { $in: ['delivered'] },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          total: { $sum: '$totalPrice' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Fill in missing dates with 0
    const filledData = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const existingData = salesData.find(d => d._id === dateStr);
      filledData.push({
        date: dateStr,
        total: existingData?.total || 0,
      });
    }

    return filledData;
  }

  async getPopularProducts() {
    return this.productModel.aggregate([
      {
        $lookup: {
          from: 'orders',
          localField: '_id',
          foreignField: 'items.product',
          as: 'orderItems',
        },
      },
      {
        $addFields: {
          sold: { $size: '$orderItems' },
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          sold: 1,
          stockQuantity: 1,
          price: 1,
        },
      },
      { $sort: { sold: -1 } },
      { $limit: 10 },
    ]);
  }
} 