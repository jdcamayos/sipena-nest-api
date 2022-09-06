import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { RegisterAuthDto } from './dto/register-auth.dto';
import { JwtService } from '@nestjs/jwt';
import { User } from './entities/user.entity';
import { ConfigService } from '@nestjs/config';
import { RecoveryPasswordDto } from './dto/recovery-password.dto';
import { MailService } from 'src/libs/mail/mail.service';

@Injectable()
export class AuthService {
  constructor(
    private mailService: MailService,
    private configService: ConfigService,
    private userService: UsersService,
    private jwtService: JwtService,
  ) {}

  async loginWithPassword(email: string, passwordInput: string) {
    const user = await this.validateEmail(email);

    if (!(await this.validatePassword(passwordInput, user.password))) {
      throw new UnauthorizedException('Password Invalid');
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, resetPasswordToken, blocked, ...result } = user;

    return result;
  }

  async loginWithJwt(id: string) {
    const user = await this.userService.findOne(id);

    if (!user) {
      throw new NotFoundException("User doesn't exists");
    }

    return user;
  }

  async validateEmail(email: string) {
    const user = await this.userService.findOneByEmail(email, true);

    if (!user) {
      throw new NotFoundException("Email doesn't registered");
    }

    return user;
  }

  async validatePassword(password: string, hash: string) {
    return await bcrypt.compare(password, hash);
  }

  async register(registerAuthDto: RegisterAuthDto) {
    const user = await this.userService.create(registerAuthDto);
    await this.mailService.registerMail(user.email);
    return this.generateToken(user as User);
  }

  generateToken(user: User) {
    const payload = { sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async forgotPassword(email: string) {
    const user = await this.validateEmail(email);

    const token = this.jwtService.sign(
      { sub: user.id },
      {
        secret: this.configService.get<string>('RECOVERY_PASSWORD_SECRET'),
        expiresIn: '1d',
      },
    );
    const { resetPasswordToken } = await this.userService.assignRecoveryToken(
      user.id,
      token,
    );
    // Send Email
    const reoveryLink = `http://localhost:3000/change-password/${resetPasswordToken}`;
    await this.mailService.forgotPasswordMail(email, reoveryLink);

    if (resetPasswordToken) return true;
    return false;
  }

  async recoveryPassword(
    recoveryToken: string,
    recoveryPasswordDto: RecoveryPasswordDto,
  ) {
    // Validate Token
    const payload = await this.jwtService.verify(recoveryToken, {
      secret: this.configService.get<string>('RECOVERY_PASSWORD_SECRET'),
    });
    // Update Password
    const user = await this.userService.updatePassword(
      payload.sub,
      recoveryPasswordDto.password,
    );
    // Login
    return this.generateToken(user as User);
  }
}
