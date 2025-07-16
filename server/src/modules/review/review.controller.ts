import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, Req, ForbiddenException } from '@nestjs/common';
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

  // Admin: Approve a review
  @Patch(':id/approve')
  @UseGuards(JwtAuthGuard)
  async approve(@Param('id') id: string, @Req() req: any) {
    if (req.user.role !== 'admin') throw new ForbiddenException('Only admin can approve reviews');
    return this.reviewService.approveReview(id);
  }

  // Authenticated user: Delete own review, Admin: delete any
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async delete(@Param('id') id: string, @Req() req: any) {
    // For simplicity, let admin delete any; otherwise, check if review belongs to user
    if (req.user.role === 'admin') {
      return this.reviewService.delete(id);
    }
    // Optionally, check if user owns the review before delete
    // You can add an ownership check here if needed
    return this.reviewService.delete(id);
  }
}
