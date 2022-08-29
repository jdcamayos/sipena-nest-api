import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/libs/prisma/prisma.module';
import { AttachmentsService } from './attachments.service';

@Module({
  imports: [PrismaModule],
  providers: [AttachmentsService],
  exports: [AttachmentsService],
})
export class AttachmentsModule {}
