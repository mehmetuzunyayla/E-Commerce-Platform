import { Controller, Get, Query, Param } from '@nestjs/common';
import { RecommendationService } from './recommendation.service';

@Controller('recommendations')
export class RecommendationController {
  constructor(private readonly recommendationService: RecommendationService) {}

  // GET /recommendations/popular
  @Get('popular')
  async getPopular(@Query('limit') limit?: number) {
    return this.recommendationService.getPopularProducts(Number(limit) || 10);
  }

  // GET /recommendations/frequently-bought-together/:productId
  @Get('frequently-bought-together/:productId')
  async getFrequentlyBoughtTogether(
    @Param('productId') productId: string,
    @Query('limit') limit?: number,
  ) {
    return this.recommendationService.getFrequentlyBoughtTogether(productId, Number(limit) || 5);
  }
}
