import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { PrismaModule } from 'src/libs/prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { WorkersModule } from '../workers/workers.module';
import { AttachmentsModule } from '../attachments/attachments.module';
import { CommentsModule } from '../comments/comments.module';
import { MulterModule } from '@nestjs/platform-express';

@Module({
  imports: [
    MulterModule.register({
      dest: './uploads',
    }),
    PrismaModule,
    ConfigModule,
    WorkersModule,
    AttachmentsModule,
    CommentsModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
