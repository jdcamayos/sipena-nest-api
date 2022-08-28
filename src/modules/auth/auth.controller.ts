import {
  Body,
  Controller,
  Request,
  Post,
  UseGuards,
  Get,
  Param,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Role } from './decorators/role.decorator';
import { Roles } from './entities/role.entity';
import { RegisterAuthDto } from './dto/register-auth.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { RoleGuard } from './guards/role.guard';
import { RequestType } from './entities/request.entity';
import { RecoveryPasswordDto } from './dto/recovery-password.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() registerAuthDto: RegisterAuthDto) {
    return this.authService.register(registerAuthDto);
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req: RequestType) {
    return this.authService.generateToken(req.user);
  }

  @Role(Roles.Admin, Roles.Worker, Roles.Customer)
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Get('me')
  getProfile(@Request() req: RequestType) {
    return req.user;
  }

  @Get('forgot-password/:email')
  async forgotPassword(@Param('email') email: string) {
    await this.authService.forgotPassword(email);
    return {
      message: `Recovery token sended to ${email}`,
    };
  }

  @Post('recovery-password/:recoveryToken')
  async recoveryPassword(
    @Param('recoveryToken') recoveryToken: string,
    @Body() recoveryPasswordDto: RecoveryPasswordDto,
  ) {
    return this.authService.recoveryPassword(
      recoveryToken,
      recoveryPasswordDto,
    );
  }
}
