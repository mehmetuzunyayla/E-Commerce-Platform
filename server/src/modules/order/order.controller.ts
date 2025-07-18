import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, Req, ForbiddenException, BadRequestException } from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderZodDto, UpdateOrderZodDto, UpdateOrderStatusZodDto } from './dto/create-order.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Types } from 'mongoose';
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
    // Use the validated data from manual validation instead of the DTO
    const { CreateOrderSchema } = await import('./dto/create-order.dto');
    const validationResult = CreateOrderSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      throw new Error('Invalid order data');
    }
    
    // Convert string IDs to ObjectIds and prepare the order data
    const orderData = {
      user: new Types.ObjectId(req.user.userId), // Convert user ID to ObjectId
      items: validationResult.data.items.map((item: any) => ({
        product: new Types.ObjectId(item.product), // Convert to ObjectId for proper population
        quantity: item.quantity,
        price: item.price,
      })),
      totalPrice: validationResult.data.totalPrice,
      shippingAddress: validationResult.data.shippingAddress,
      addressLabel: validationResult.data.addressLabel,
      addressId: validationResult.data.addressId,
      paymentMethod: validationResult.data.paymentMethod || 'cash',
      status: validationResult.data.status || 'pending',
    };
    
    return this.orderService.create(orderData);
  }

  // Guest user: Create order without authentication
  @Post('guest')
  async createGuestOrder(@Body() guestOrderData: any) {
    // Validate guest order data
    if (!guestOrderData.items || !Array.isArray(guestOrderData.items) || guestOrderData.items.length === 0) {
      throw new BadRequestException('Order must contain at least one item');
    }
    
    if (!guestOrderData.guestInfo) {
      throw new BadRequestException('Guest information is required');
    }
    
    // Prepare guest order data
    const orderData = {
      // Don't include user field for guest orders
      guestInfo: {
        firstName: guestOrderData.guestInfo.firstName,
        lastName: guestOrderData.guestInfo.lastName,
        email: guestOrderData.guestInfo.email,
        phone: guestOrderData.guestInfo.phone,
        fullName: guestOrderData.guestInfo.fullName,
      },
      items: guestOrderData.items.map((item: any) => ({
        product: new Types.ObjectId(item.product._id || item.product),
        quantity: item.quantity,
        price: item.product.price || item.price,
      })),
      totalPrice: guestOrderData.total,
      shippingAddress: `${guestOrderData.guestInfo.address}, ${guestOrderData.guestInfo.city}, ${guestOrderData.guestInfo.state} ${guestOrderData.guestInfo.zipCode}, ${guestOrderData.guestInfo.country}`,
      addressLabel: 'Guest Address',
      paymentMethod: 'cash',
      status: 'pending',
    };
    
    // Create order without user field for guest orders
    const order = await this.orderService.create(orderData as any);
    return order;
  }

  // Admin: Update order status
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(@Param('id') id: string, @Body() updateOrderDto: any, @Req() req: any) {
    if (req.user.role !== 'admin') throw new ForbiddenException('Only admin can update orders');
    
    // Manual validation without Zod to avoid version conflicts
    try {
      // Basic validation
      if (!req.body.status) {
        throw new BadRequestException('Order status is required');
      }
      
      const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
      if (!validStatuses.includes(req.body.status)) {
        throw new BadRequestException(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
      }
      
      return await this.orderService.updateStatus(id, req.body.status);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      console.error('Order status update error:', error);
      throw new BadRequestException('Failed to update order status');
    }
  }

  // Admin: Delete any order
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async delete(@Param('id') id: string, @Req() req: any) {
    if (req.user.role !== 'admin') throw new ForbiddenException('Only admin can delete orders');
    return this.orderService.delete(id);
  }
}
