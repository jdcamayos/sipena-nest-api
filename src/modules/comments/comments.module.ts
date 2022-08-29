import { Module } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { PrismaModule } from 'src/libs/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [CommentsService],
  exports: [CommentsService],
})
export class CommentsModule {}
