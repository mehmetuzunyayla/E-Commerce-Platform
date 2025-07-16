import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, Req, ForbiddenException } from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderZodDto, UpdateOrderZodDto } from './dto/create-order.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
// import { UserRequest } from '../../common/types/user-request.type'; // Uncomment if using custom type

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  // Admin: View all orders
  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(@Req() req: any) { // Use UserRequest if you have the type
    if (req.user.role !== 'admin') throw new ForbiddenException('Only admin can view all orders');
    return this.orderService.findAll();
  }

  // Authenticated user or admin: View one order
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findById(@Param('id') id: string, @Req() req: any) {
    const order = await this.orderService.findById(id);
    if (order.user.toString() !== req.user.userId && req.user.role !== 'admin') {
      throw new ForbiddenException('You can only view your own orders');
    }
    return order;
  }

  // Authenticated user: View their orders
  @Get('user/:userId')
  @UseGuards(JwtAuthGuard)
  async findByUser(@Param('userId') userId: string, @Req() req: any) {
    if (req.user.userId !== userId && req.user.role !== 'admin') {
      throw new ForbiddenException('You can only view your own orders');
    }
    return this.orderService.findByUser(userId);
  }

  // Authenticated user: Create order
  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Req() req: any, @Body() createOrderDto: CreateOrderZodDto) {
    return this.orderService.create({user: req.user.userId, ...req.body});
  }

  // Admin: Update order status
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderZodDto, @Req() req: any) {
    if (req.user.role !== 'admin') throw new ForbiddenException('Only admin can update orders');
    return this.orderService.updateStatus(id, updateOrderDto.status);
  }

  // Admin: Delete any order
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async delete(@Param('id') id: string, @Req() req: any) {
    if (req.user.role !== 'admin') throw new ForbiddenException('Only admin can delete orders');
    return this.orderService.delete(id);
  }
}
