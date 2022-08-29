import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/libs/prisma/prisma.module';
import { WorkersService } from './workers.service';

@Module({
  imports: [PrismaModule],
  providers: [WorkersService],
  exports: [WorkersService],
})
export class WorkersModule {}
