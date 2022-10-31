import { ConfigModule, ConfigService } from '@nestjs/config';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { resolve } from 'path';
import { MailerModule } from '@nestjs-modules/mailer';
import { MailService } from './mail.service';
import { Module, Global } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';

@Global()
@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (config: ConfigService) => ({
        transport: {
          service: 'Outlook365',
          host: config.get('EMAIL_HOST'),
          port: config.get('EMAIL_PORT'),
          secure: true,
          auth: {
            user: config.get('EMAIL_USER'),
            pass: config.get('EMAIL_PASSWORD'),
          },
          tls: {
            ciphers: 'SSLv3',
            rejectUnauthorized: false,
          },
          logger: true,
          debug: true,
        },
        defaults: {
          from: `No-Reply <${config.get('EMAIL_USER')}>`,
        },
        template: {
          dir: resolve('dist', 'templates'),
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
      inject: [ConfigService],
    }),
    PrismaModule,
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
