import { Controller, Get, Param, Patch, Delete, Body, Post, UseGuards, Req, ForbiddenException, BadRequestException } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserZodDto, UpdateUserZodDto } from './dto/create-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard'; // adjust path as needed
import { UserRequest } from '../../common/types/user-request.type';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // Only admin can get all users
  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(@Req() req: UserRequest) {
    if (req.user.role !== 'admin') throw new ForbiddenException('Only admin can view all users');
    return this.userService.findAll();
  }

  // User can view own profile, or admin can view any profile
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findById(@Param('id') id: string, @Req() req: UserRequest) {
    if (req.user.userId !== id && req.user.role !== 'admin') throw new ForbiddenException('You can only view your own profile');
    return this.userService.findById(id);
  }

  // Registration: public
  @Post()
  async create(@Body() createUserDto: CreateUserZodDto) {
    return this.userService.create(createUserDto);
  }

  // User can update own profile, or admin can update any
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserZodDto, @Req() req: UserRequest) {
    if (req.user.userId !== id && req.user.role !== 'admin') throw new ForbiddenException('You can only update your own profile');
    return this.userService.update(id, updateUserDto);
  }

  // Only admin can delete any user, or user can delete own account
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async delete(@Param('id') id: string, @Req() req: UserRequest) {
    if (req.user.userId !== id && req.user.role !== 'admin') throw new ForbiddenException('You can only delete your own account');
    return this.userService.delete(id);
  }

  // Address management endpoints
  @Get(':id/addresses')
  @UseGuards(JwtAuthGuard)
  async getAddresses(@Param('id') id: string, @Req() req: UserRequest) {
    if (req.user.userId !== id && req.user.role !== 'admin') throw new ForbiddenException('You can only view your own addresses');
    return this.userService.getAddresses(id);
  }

  @Post(':id/addresses')
  @UseGuards(JwtAuthGuard)
  async addAddress(@Param('id') id: string, @Body() addressData: any, @Req() req: UserRequest) {
    if (req.user.userId !== id && req.user.role !== 'admin') throw new ForbiddenException('You can only add addresses to your own profile');
    
    // Manual validation without Zod to avoid version conflicts
    try {
      // Basic validation for required fields according to schema
      if (!addressData.label || !addressData.fullName || !addressData.street || !addressData.city || !addressData.zip || !addressData.country || !addressData.phone) {
        throw new BadRequestException('All address fields are required: label, fullName, street, city, zip, country, phone');
      }
      
      // Validate string lengths
      if (addressData.label.length < 1) throw new BadRequestException('Label is required');
      if (addressData.fullName.length < 1) throw new BadRequestException('Full name is required');
      if (addressData.street.length < 1) throw new BadRequestException('Street is required');
      if (addressData.city.length < 1) throw new BadRequestException('City is required');
      if (addressData.zip.length < 1) throw new BadRequestException('ZIP code is required');
      if (addressData.country.length < 1) throw new BadRequestException('Country is required');
      if (addressData.phone.length < 1) throw new BadRequestException('Phone is required');
      
      return await this.userService.addAddress(id, addressData);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      console.error('Address creation error:', error);
      throw new BadRequestException('Failed to create address');
    }
  }

  @Patch(':id/addresses/:addressId')
  @UseGuards(JwtAuthGuard)
  async updateAddress(@Param('id') id: string, @Param('addressId') addressId: string, @Body() addressData: any, @Req() req: UserRequest) {
    if (req.user.userId !== id && req.user.role !== 'admin') throw new ForbiddenException('You can only update your own addresses');
    
    // Manual validation without Zod to avoid version conflicts
    try {
      // Validate provided fields according to schema
      if (addressData.label !== undefined && addressData.label.length < 1) {
        throw new BadRequestException('Label cannot be empty');
      }
      if (addressData.fullName !== undefined && addressData.fullName.length < 1) {
        throw new BadRequestException('Full name cannot be empty');
      }
      if (addressData.street !== undefined && addressData.street.length < 1) {
        throw new BadRequestException('Street cannot be empty');
      }
      if (addressData.city !== undefined && addressData.city.length < 1) {
        throw new BadRequestException('City cannot be empty');
      }
      if (addressData.zip !== undefined && addressData.zip.length < 1) {
        throw new BadRequestException('ZIP code cannot be empty');
      }
      if (addressData.country !== undefined && addressData.country.length < 1) {
        throw new BadRequestException('Country cannot be empty');
      }
      if (addressData.phone !== undefined && addressData.phone.length < 1) {
        throw new BadRequestException('Phone cannot be empty');
      }
      
      return await this.userService.updateAddress(id, addressId, addressData);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      console.error('Address update error:', error);
      throw new BadRequestException('Failed to update address');
    }
  }

  @Delete(':id/addresses/:addressId')
  @UseGuards(JwtAuthGuard)
  async deleteAddress(@Param('id') id: string, @Param('addressId') addressId: string, @Req() req: UserRequest) {
    if (req.user.userId !== id && req.user.role !== 'admin') throw new ForbiddenException('You can only delete your own addresses');
    return this.userService.deleteAddress(id, addressId);
  }
}
