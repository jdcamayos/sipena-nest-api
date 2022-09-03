import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/libs/prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async getMeta(params: {
    skip?: number;
    take?: number;
    where?: Prisma.OrderWhereInput;
  }) {
    const { skip, take, where } = params;
    const count = await this.prisma.order.count({
      where,
    });
    return {
      page: skip / take + 1,
      pages: Math.ceil(count / take),
      itemsPerPage: take,
      totalItems: count,
    };
  }

  async create(createOrderDto: CreateOrderDto) {
    return await this.prisma.$transaction(async (prisma) => {
      const order = await prisma.order.create({
        data: {
          customerId: createOrderDto.customerId,
          date: createOrderDto.date,
        },
      });
      if (!order.id) {
        throw new Error(`Error creating order`);
      }
      const containersForCreate = createOrderDto.containers.map((c) => ({
        ...c,
        orderId: order.id,
      }));
      const containers = await prisma.container.createMany({
        data: containersForCreate,
      });
      if (containers)
        return prisma.order.findUnique({
          where: {
            id: order.id,
          },
          include: {
            containers: true,
          },
        });
    });
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    where?: Prisma.OrderWhereInput;
    orderBy?: Prisma.OrderOrderByWithRelationInput;
  }) {
    const { skip, take, where, orderBy } = params;
    const findAllOrders = async () =>
      await this.prisma.order.findMany({
        skip,
        take,
        where,
        orderBy: orderBy
          ? orderBy
          : {
              createdAt: 'desc',
            },
        include: {
          customer: {
            select: {
              user: {
                select: {
                  email: true,
                },
              },
            },
          },
          _count: {
            select: {
              attachments: true,
              comments: true,
              containers: true,
              workers: true,
            },
          },
        },
      });
    const [data, meta] = await Promise.all([
      findAllOrders(),
      this.getMeta({ where, skip, take }),
    ]);
    return { data, meta };
  }

  async findOne(id: string) {
    const order = await this.prisma.order.findUnique({
      where: {
        id,
      },
      include: {
        attachments: true,
        comments: true,
        containers: true,
        workers: {
          select: {
            assignedBy: true,
            user: {
              select: {
                id: true,
                email: true,
              },
            },
          },
        },
      },
    });
    return order;
  }

  // async update(id: string, updateOrderDto: UpdateOrderDto) {
  //   const order = await this.prisma.order.update({
  //     where: {
  //       id,
  //     },
  //     data: updateOrderDto,
  //   });
  //   return order;
  // }

  async remove(id: string) {
    const order = await this.prisma.order.delete({
      where: {
        id,
      },
    });
    return order;
  }
}
