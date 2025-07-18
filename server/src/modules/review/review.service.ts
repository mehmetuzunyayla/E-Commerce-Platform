import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Review, ReviewDocument } from './review.schema';
import { Order, OrderDocument } from '../order/order.schema';

@Injectable()
export class ReviewService {
  constructor(
    @InjectModel(Review.name) private reviewModel: Model<ReviewDocument>,
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
  ) {}

  async create(reviewData: Partial<Review>): Promise<Review> {
    const userId = reviewData.user?.toString() || '';
    const productId = reviewData.product?.toString() || '';
    
    // Check if user has purchased this product
    const hasPurchased = await this.hasUserPurchasedProduct(
      new Types.ObjectId(userId), 
      new Types.ObjectId(productId)
    );
    if (!hasPurchased) {
      throw new ForbiddenException('You can only review products you have purchased');
    }

    // Check if user has already reviewed this product
    const existingReview = await this.reviewModel.findOne({
      user: new Types.ObjectId(userId),
      product: new Types.ObjectId(productId)
    }).exec();

    if (existingReview) {
      throw new ForbiddenException('You have already reviewed this product');
    }

    // Convert string IDs to ObjectIds for storage
    const reviewToCreate = {
      ...reviewData,
      user: new Types.ObjectId(userId),
      product: new Types.ObjectId(productId)
    };

    const createdReview = await this.reviewModel.create(reviewToCreate);
    
    return createdReview;
  }

  async findAll(): Promise<Review[]> {
    return this.reviewModel.find()
      .populate('user', 'email')
      .exec();
  }

  async findByProduct(productId: string): Promise<Review[]> {
    // Try both string and ObjectId versions
    const reviews = await this.reviewModel.find({ 
      product: { $in: [productId, new Types.ObjectId(productId)] }
    })
      .populate('user', 'email')
      .exec();
    
    return reviews;
  }



  async findById(id: string): Promise<Review> {
    const review = await this.reviewModel.findById(id).exec();
    if (!review) throw new NotFoundException('Review not found');
    return review;
  }

  async update(id: string, updateData: Partial<Review>): Promise<Review> {
    const review = await this.reviewModel.findByIdAndUpdate(id, updateData, { new: true }).exec();
    if (!review) throw new NotFoundException('Review not found');
    
    return review;
  }



  async delete(id: string): Promise<void> {
    const res = await this.reviewModel.findByIdAndDelete(id).exec();
    if (!res) throw new NotFoundException('Review not found');
  }

  private async hasUserPurchasedProduct(userId: Types.ObjectId, productId: Types.ObjectId): Promise<boolean> {
    // Find orders for this user that contain this product - ONLY delivered orders
    const order = await this.orderModel.findOne({
      user: userId.toString(), // Search by string ID since that's how it's stored
      'items.product': productId,
      status: 'delivered' // Only allow reviews for delivered orders
    }).exec();

    return !!order; // Return true if delivered order exists, false otherwise
  }

  async canUserReviewProduct(userId: string, productId: string): Promise<boolean> {
    // Check if user has purchased the product
    const hasPurchased = await this.hasUserPurchasedProduct(
      new Types.ObjectId(userId),
      new Types.ObjectId(productId)
    );

    if (!hasPurchased) {
      return false;
    }

    // Check if user has already reviewed this product
    const existingReview = await this.reviewModel.findOne({
      user: new Types.ObjectId(userId),
      product: new Types.ObjectId(productId)
    }).exec();

    const canReview = !existingReview;
    
    return canReview; // Can review if no existing review
  }
}
