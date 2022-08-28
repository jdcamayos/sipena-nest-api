import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Payload } from '../entities/payload.entity';
import { AuthService } from '../auth.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false, // Just development
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: Payload) {
    const user = await this.authService.loginWithJwt(payload.sub);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
