import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/libs/prisma/prisma.module';
import { ContainersService } from './containers.service';

@Module({
  imports: [PrismaModule],
  providers: [ContainersService],
  exports: [ContainersService],
})
export class ContainersModule {}
