import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './libs/prisma/prisma.module';
import { CustomersModule } from './modules/customers/customers.module';
import { UsersModule } from './modules/users/users.module';
import { ConfigModule } from '@nestjs/config';
// import { OrdersModule } from './modules/orders/orders.module';
import { AuthModule } from './modules/auth/auth.module';
import config from './config';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      load: [config],
      isGlobal: true,
      expandVariables: true,
    }),
    AuthModule,
    UsersModule,
    PrismaModule,
    CustomersModule,
    // OrdersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
