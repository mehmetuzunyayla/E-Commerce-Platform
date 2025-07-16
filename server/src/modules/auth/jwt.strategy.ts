import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get<string>('JWT_SECRET') || 'default_jwt_secret',
    });
  }

  async validate(payload: any) {
    // This attaches user info to req.user
    // You can add more fields here as needed
    return {
      userId: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  }
}
