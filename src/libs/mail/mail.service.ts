import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async registerMail(email: string) {
    return await this.mailerService.sendMail({
      to: email,
      subject: 'Greeting from Sipena Orders App',
      template: './register',
      context: {
        email,
      },
    });
  }

  async forgotPasswordMail(email: string, recoveryLink: string) {
    return await this.mailerService.sendMail({
      to: email,
      subject: 'Recovery your password',
      template: './forgot-password',
      context: {
        email,
        recoveryLink,
      },
    });
  }

  async createOrderMail() {
    return;
  }

  async finishedOrderMail() {
    return;
  }

  async workerAssignedMail() {
    return;
  }
}
