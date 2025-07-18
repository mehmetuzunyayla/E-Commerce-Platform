import { Controller, Get, UseGuards, Req, ForbiddenException } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard-stats')
  @UseGuards(JwtAuthGuard)
  async getDashboardStats(@Req() req: any) {
    if (req.user.role !== 'admin') {
      throw new ForbiddenException('Only admin can access dashboard stats');
    }
    return this.adminService.getDashboardStats();
  }

  @Get('sales-data')
  @UseGuards(JwtAuthGuard)
  async getSalesData(@Req() req: any) {
    if (req.user.role !== 'admin') {
      throw new ForbiddenException('Only admin can access sales data');
    }
    return this.adminService.getSalesData();
  }

  @Get('popular-products')
  @UseGuards(JwtAuthGuard)
  async getPopularProducts(@Req() req: any) {
    if (req.user.role !== 'admin') {
      throw new ForbiddenException('Only admin can access popular products');
    }
    return this.adminService.getPopularProducts();
  }
} 