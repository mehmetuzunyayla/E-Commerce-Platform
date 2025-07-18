import { Controller, Get, Post, Delete, Param, Body, UseGuards, Req } from '@nestjs/common';
import { WishlistService } from './wishlist.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('wishlist')
@UseGuards(JwtAuthGuard)
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Get()
  async getWishlist(@Req() req: any) {
    const wishlist = await this.wishlistService.getWishlistByUser(req.user.userId);
    return { items: wishlist.items.map(item => item._id.toString()) };
  }

  @Post()
  async updateWishlist(@Req() req: any, @Body() body: { items: string[] }) {
    const wishlist = await this.wishlistService.updateWishlist(req.user.userId, body.items);
    return { items: wishlist.items.map(item => item._id.toString()) };
  }

  @Post('add/:productId')
  async addToWishlist(@Req() req: any, @Param('productId') productId: string) {
    const wishlist = await this.wishlistService.addToWishlist(req.user.userId, productId);
    return { items: wishlist.items.map(item => item._id.toString()) };
  }

  @Delete('remove/:productId')
  async removeFromWishlist(@Req() req: any, @Param('productId') productId: string) {
    const wishlist = await this.wishlistService.removeFromWishlist(req.user.userId, productId);
    return { items: wishlist.items.map(item => item._id.toString()) };
  }

  @Delete('clear')
  async clearWishlist(@Req() req: any) {
    await this.wishlistService.clearWishlist(req.user.userId);
    return { items: [] };
  }
} 