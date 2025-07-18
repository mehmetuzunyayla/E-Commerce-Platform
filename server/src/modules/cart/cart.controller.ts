import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, Req, ForbiddenException, BadRequestException } from '@nestjs/common';
import { CartService } from './cart.service';
import { AddCartItemZodDto, UpdateCartItemZodDto } from './dto/add-cart-item.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
// import { UserRequest } from '../../common/types/user-request.type'; // Uncomment if using custom type

@Controller('carts')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  // Authenticated user: Get their cart
  @Get()
  @UseGuards(JwtAuthGuard)
  async getCart(@Req() req: any) {
    const cart = await this.cartService.getCartByUser(req.user.userId);

    return cart;
  }

  // Guest user: Get cart from session
  @Get('guest')
  async getGuestCart(@Req() req: any) {
    // For guest users, we'll use a session-based approach
    // For now, return empty cart structure
    return { items: [] };
  }

  // Guest user: Add item to cart (no authentication required)
  @Post('guest/items')
  async addGuestItem(@Req() req: any, @Body() addCartItemDto: any) {
    // Manual validation without Zod to avoid version conflicts
    try {

      
      // Basic validation
      if (!req.body.product) {
        throw new BadRequestException('Product ID is required');
      }
      if (!req.body.quantity || req.body.quantity < 1) {
        throw new BadRequestException('Quantity must be at least 1');
      }
      
      // For guest users, we'll store cart in session or return success
      // For now, just return success with the item
      const result = {
        items: [{
          product: req.body.product,
          quantity: req.body.quantity,
          selectedVariant: req.body.selectedVariant || null,
        }]
      };
      

      return result;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      console.error('Guest cart item creation error:', error);
      throw new BadRequestException('Failed to add item to cart');
    }
  }

  // Authenticated user: Add item to their cart
  @Post('items')
  @UseGuards(JwtAuthGuard)
  async addItem(@Req() req: any, @Body() addCartItemDto: any) {
    // Manual validation without Zod to avoid version conflicts
    try {

      
      // Basic validation
      if (!req.body.product) {
        throw new BadRequestException('Product ID is required');
      }
      if (!req.body.quantity || req.body.quantity < 1) {
        throw new BadRequestException('Quantity must be at least 1');
      }
      
      const result = await this.cartService.addItem(req.user.userId, req.body);

      return result;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      console.error('Cart item creation error:', error);
      throw new BadRequestException('Failed to add item to cart');
    }
  }

  // Authenticated user: Update item in their cart
  @Patch('items/:productId')
  @UseGuards(JwtAuthGuard)
  async updateItem(
    @Req() req: any,
    @Param('productId') productId: string,
    @Body() updateCartItemDto: any,
  ) {
    // Manual validation without Zod to avoid version conflicts
    try {
      // Basic validation
      if (req.body.quantity !== undefined && (req.body.quantity < 1 || !Number.isInteger(req.body.quantity))) {
        throw new BadRequestException('Quantity must be a positive integer');
      }
      
      return await this.cartService.updateItem(req.user.userId, productId, req.body);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      console.error('Cart item update error:', error);
      throw new BadRequestException('Failed to update cart item');
    }
  }

  // Authenticated user: Remove item from their cart
  @Delete('items/:productId')
  @UseGuards(JwtAuthGuard)
  async removeItem(@Req() req: any, @Param('productId') productId: string) {
    return this.cartService.removeItem(req.user.userId, productId);
  }

  // Authenticated user: Clear their cart
  @Delete('clear')
  @UseGuards(JwtAuthGuard)
  async clearCart(@Req() req: any) {
    return this.cartService.clearCart(req.user.userId);
  }
}
