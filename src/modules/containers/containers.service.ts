import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/libs/prisma/prisma.service';
import { CreateContainerDto } from './dto/create-container.dto';

@Injectable()
export class ContainersService {
  constructor(private prisma: PrismaService) {}

  async create(createContainerDto: CreateContainerDto) {
    const container = await this.prisma.container.create({
      data: createContainerDto,
    });
    return container;
  }

  async createMany(createContainerDto: CreateContainerDto[]) {
    const containers = await this.prisma.container.createMany({
      data: createContainerDto,
    });
    return containers;
  }
}
