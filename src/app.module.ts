import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './libs/prisma/prisma.module';
import { CustomersModule } from './modules/customers/customers.module';
import { UsersModule } from './modules/users/users.module';
import { ConfigModule } from '@nestjs/config';
import { OrdersModule } from './modules/orders/orders.module';
import { AuthModule } from './modules/auth/auth.module';
import { UploadsModule } from './modules/uploads/uploads.module';
import { MailService } from './libs/mail/mail.service';
import { MailModule } from './libs/mail/mail.module';
import { PublicModule } from './modules/public/public.module';
import config from './config';
import { LoggerMiddleware } from './middleware/logger.middleware';
import { LoggerModule } from 'nestjs-pino';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      load: [config],
      isGlobal: true,
      expandVariables: true,
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        transport: {
          target: 'pino-pretty',
          options: {
            singleLine: true,
          },
        },
      },
    }),
    MailModule,
    AuthModule,
    UsersModule,
    PrismaModule,
    CustomersModule,
    OrdersModule,
    UploadsModule,
    PublicModule,
  ],
  controllers: [AppController],
  providers: [AppService, MailService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
