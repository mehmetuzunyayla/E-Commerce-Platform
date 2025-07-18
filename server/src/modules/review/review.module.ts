import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Review, ReviewSchema } from './review.schema';
import { ReviewService } from './review.service';
import { ReviewController } from './review.controller';
import { Order, OrderSchema } from '../order/order.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Review.name, schema: ReviewSchema },
      { name: Order.name, schema: OrderSchema },
    ]),
  ],
  providers: [ReviewService],
  controllers: [ReviewController],
  exports: [ReviewService],
})
export class ReviewModule {}
