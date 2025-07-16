import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, Req, ForbiddenException } from '@nestjs/common';
import { CartService } from './cart.service';
import { AddCartItemZodDto, UpdateCartItemZodDto } from './dto/add-cart-item.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
// import { UserRequest } from '../../common/types/user-request.type'; // Uncomment if using custom type

@Controller('carts')
@UseGuards(JwtAuthGuard) // All routes require login
export class CartController {
  constructor(private readonly cartService: CartService) {}

  // Authenticated user: Get their cart
  @Get()
  async getCart(@Req() req: any) {
    return this.cartService.getCartByUser(req.user.userId);
  }

  // Authenticated user: Add item to their cart
  @Post('items')
  async addItem(@Req() req: any, @Body() addCartItemDto: AddCartItemZodDto) {
     //return this.cartService.addItem(req.user.userId, addCartItemDto); // Problems happened when this line used also this is a general problem of zod
    return this.cartService.addItem(req.user.userId, req.body);
  
  }

  // Authenticated user: Update item in their cart
  @Patch('items/:productId')
  async updateItem(
    @Req() req: any,
    @Param('productId') productId: string,
    @Body() updateCartItemDto: UpdateCartItemZodDto,
  ) {
    return this.cartService.updateItem(req.user.userId, productId, updateCartItemDto);
  }

  // Authenticated user: Remove item from their cart
  @Delete('items/:productId')
  async removeItem(@Req() req: any, @Param('productId') productId: string) {
    return this.cartService.removeItem(req.user.userId, productId);
  }

  // Authenticated user: Clear their cart
  @Delete('clear')
  async clearCart(@Req() req: any) {
    return this.cartService.clearCart(req.user.userId);
  }
}
