import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { MailService } from 'src/libs/mail/mail.service';
import { PrismaService } from 'src/libs/prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
  ) {}

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
    const order = await this.prisma.$transaction(async (prisma) => {
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
    this.mailService
      .newOrderMail({ orderId: order.id })
      .then((res) => console.log(res))
      .catch((err) => console.log(err));
    return order;
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
              companyName: true,
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
        comments: {
          include: {
            author: {
              select: {
                email: true,
                role: true,
                image: true,
              },
            },
          },
        },
        containers: true,
        workers: {
          orderBy: {
            user: {
              email: 'asc',
            },
          },
          include: {
            user: {
              select: {
                email: true,
              },
            },
          },
        },
      },
    });
    return order;
  }

  async update(id: string, updateOrderDto: UpdateOrderDto) {
    const order = await this.prisma.order.update({
      where: {
        id,
      },
      data: updateOrderDto,
    });
    return order;
  }

  async remove(id: string) {
    const order = await this.prisma.order.delete({
      where: {
        id,
      },
    });
    return order;
  }
}
