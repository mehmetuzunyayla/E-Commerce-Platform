import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { any } from 'zod';
import { Get, Query, Res } from '@nestjs/common';
import { Response } from 'express';
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: any) {
    const user = await this.authService.register(registerDto);
    return { message: 'Registration successful. Please verify your email.', user };
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() loginDto: { email: string; password: string }) {
    const user = await this.authService.validateUser(loginDto.email, loginDto.password);
    return this.authService.login(user);
  }

  @Post('verify-email')
  async verifyEmail(@Body('token') token: string) {
    return this.authService.verifyEmail(token);
  }
  
  @Get('verify-email')
  async verifyEmailByGet(@Query('token') token: string, @Res() res: Response) {
  await this.authService.verifyEmail(token);
  return res.status(200).send('Email verified successfully! You may now login.');
  }

  @UseGuards(JwtAuthGuard)
  @Post('me')
  async me(@Req() req: any) {
    return req.user;
  }
}
