import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './libs/prisma/prisma.module';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [UsersModule, PrismaModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
