import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, Req, ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { ReviewService } from './review.service';
import { CreateReviewZodDto, UpdateReviewZodDto } from './dto/create-review.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
// import { UserRequest } from '../../common/types/user-request.type'; // Uncomment if using custom type

@Controller('reviews')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  // Public: List all reviews
  @Get()
  async findAll() {
    return this.reviewService.findAll();
  }

  // Public: Check if user can review a product (for frontend validation)
  @Get('can-review/:productId')
  @UseGuards(JwtAuthGuard)
  async canReview(@Param('productId') productId: string, @Req() req: any) {
    const canReview = await this.reviewService.canUserReviewProduct(req.user.userId, productId);
    return { canReview };
  }

  // Public: List reviews for a product
  @Get('product/:productId')
  async findByProduct(@Param('productId') productId: string) {
    return this.reviewService.findByProduct(productId);
  }



  // Authenticated user: Create a review
  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Req() req: any, @Body() createReviewDto: CreateReviewZodDto) {
    return this.reviewService.create({ ...req.body, user: req.user.userId });
  }



  // Authenticated user: Update own review, Admin: update any
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(@Param('id') id: string, @Body() updateData: any, @Req() req: any) {
    const review = await this.reviewService.findById(id);
    if (!review) throw new NotFoundException('Review not found');
    
    // Check if user owns the review or is admin
    if (review.user.toString() !== req.user.userId && req.user.role !== 'admin') {
      throw new ForbiddenException('You can only update your own reviews');
    }
    
    // Manual validation
    if (updateData.rating !== undefined && (updateData.rating < 1 || updateData.rating > 5)) {
      throw new BadRequestException('Rating must be between 1 and 5');
    }
    
    const updatedReview = await this.reviewService.update(id, updateData);
    
    return updatedReview;
  }

  // Authenticated user: Delete own review, Admin: delete any
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async delete(@Param('id') id: string, @Req() req: any) {
    const review = await this.reviewService.findById(id);
    if (!review) throw new NotFoundException('Review not found');
    
    // Check if user owns the review or is admin
    if (review.user.toString() !== req.user.userId && req.user.role !== 'admin') {
      throw new ForbiddenException('You can only delete your own reviews');
    }
    
    return this.reviewService.delete(id);
  }
}
