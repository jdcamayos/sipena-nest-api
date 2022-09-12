import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/libs/prisma/prisma.service';
import { AssignToOrderDto } from './dto/assign-to-order.dto';

@Injectable()
export class WorkersService {
  constructor(private prisma: PrismaService) {}

  async assignToOrder(assignToOrderDto: AssignToOrderDto) {
    const workerExists = await this.prisma.worker.findFirst({
      where: {
        AND: {
          userId: assignToOrderDto.userId,
          orderId: assignToOrderDto.orderId,
        },
      },
    });
    if (workerExists) {
      throw new BadRequestException('Worker is already assigned to this order');
    }
    const worker = await this.prisma.worker.create({
      data: assignToOrderDto,
      include: {
        user: {
          select: {
            email: true,
          },
        },
      },
    });
    return worker;
  }
}
