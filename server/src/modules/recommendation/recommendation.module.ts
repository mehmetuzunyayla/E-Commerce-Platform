import { Module } from '@nestjs/common';
import { ProductModule } from '../product/product.module';
import { OrderModule } from '../order/order.module';
import { RecommendationService } from './recommendation.service';
import { RecommendationController } from './recommendation.controller';

@Module({
  imports: [ProductModule, OrderModule],
  providers: [RecommendationService],
  controllers: [RecommendationController],
  exports: [RecommendationService],
})
export class RecommendationModule {}
