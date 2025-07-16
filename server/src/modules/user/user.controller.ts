import { Controller, Get, Param, Patch, Delete, Body, Post, UseGuards, Req, ForbiddenException } from '@nestjs/common';
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
}
