import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';
import { MailService } from 'src/libs/mail/mail.service';

@ApiTags('test')
@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly mailService: MailService,
  ) {}

  @Get('ping')
  pingPong() {
    return {
      ping: 'pong',
    };
  }

  @Get('test-email/:email')
  async testEmail(@Param('email') email: string) {
    return await this.mailService.testEmail(email);
  }
}
