import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/libs/prisma/prisma.service';
import { AssignToOrderDto } from './dto/assign-to-order.dto';

@Injectable()
export class WorkersService {
  constructor(private prisma: PrismaService) {}

  async assignToOrder(assignToOrderDto: AssignToOrderDto) {
    const worker = await this.prisma.worker.create({
      data: assignToOrderDto,
    });
    return worker;
  }
}
