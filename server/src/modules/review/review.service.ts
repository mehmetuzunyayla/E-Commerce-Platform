import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Review, ReviewDocument } from './review.schema';

@Injectable()
export class ReviewService {
  constructor(
    @InjectModel(Review.name) private reviewModel: Model<ReviewDocument>,
  ) {}

  async create(reviewData: Partial<Review>): Promise<Review> {
    return this.reviewModel.create(reviewData);
  }

  async findAll(): Promise<Review[]> {
    return this.reviewModel.find().exec();
  }

  async findByProduct(productId: string): Promise<Review[]> {
    return this.reviewModel.find({ product: productId, isApproved: true }).exec();
  }

  async approveReview(id: string): Promise<Review> {
    const review = await this.reviewModel.findByIdAndUpdate(id, { isApproved: true }, { new: true }).exec();
    if (!review) throw new NotFoundException('Review not found');
    return review;
  }

  async delete(id: string): Promise<void> {
    const res = await this.reviewModel.findByIdAndDelete(id).exec();
    if (!res) throw new NotFoundException('Review not found');
  }
}
