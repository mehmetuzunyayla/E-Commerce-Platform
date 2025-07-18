import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UserService } from '../user/user.service';
import { EmailService } from '../../common/email.service'; // adjust path if needed
import { randomBytes } from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
  ) {}

  async register(registerDto: any) {
    const existingUser = await this.userService.findByEmail(registerDto.email);
    if (existingUser) throw new ConflictException('Email already in use');
    const hashed = await bcrypt.hash(registerDto.password, 10);
    const emailVerificationToken = randomBytes(32).toString('hex');
    
    const user = await this.userService.create({
      ...registerDto,
      password: hashed,
      emailVerified: false,
      emailVerificationToken,
    });

    // Send verification email
    const verifyUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${emailVerificationToken}`;
    await this.emailService.sendMail(
      user.email,
      'Verify Your Email',
      `<p>Please verify your email by clicking <a href="${verifyUrl}">this link</a></p>`
    );

    return user;
  }

  async verifyEmail(token: string) {
    const user = await this.userService.findByVerificationToken(token);
    if (!user) throw new BadRequestException('Invalid or expired token');
    await this.userService.update((user as any)._id, { emailVerified: true, emailVerificationToken: null });
    return { message: 'Email verified' };
  }

  async validateUser(email: string, password: string) {
    const user = await this.userService.findByEmail(email);
    if (!user) throw new UnauthorizedException('Invalid credentials');
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');
    if (!user.emailVerified) throw new UnauthorizedException('Email not verified');
    return user;
  }

  async login(user: any) {
    const payload = { sub: user._id, email: user.email, role: user.role };
    return {
      accessToken: this.jwtService.sign(payload),
      user,
    };
  }
}
