import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/libs/prisma/prisma.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Injectable()
export class CustomersService {
  constructor(private prisma: PrismaService) {}

  async getMeta(params: {
    skip?: number;
    take?: number;
    where?: Prisma.UserWhereInput;
  }) {
    const { skip, take, where } = params;
    const count = await this.prisma.customer.count({
      where,
    });
    return {
      page: skip / take + 1,
      pages: Math.ceil(count / take),
      itemsPerPage: take,
      totalItems: count,
    };
  }

  async create(createCustomerDto: CreateCustomerDto) {
    if (await this.findOneByUser(createCustomerDto.userId)) {
      throw new BadRequestException('Customer is already created');
    }
    const customer = await this.prisma.customer.create({
      data: createCustomerDto,
    });
    return customer;
  }

  async findAll(params: { skip?: number; take?: number }) {
    const { skip, take } = params;
    const findAllCustomers = async () =>
      await this.prisma.customer.findMany({
        include: {
          user: {
            select: {
              id: true,
              email: true,
            },
          },
        },
      });
    const [data, meta] = await Promise.all([
      findAllCustomers(),
      this.getMeta({ skip, take }),
    ]);
    return { data, meta };
  }

  async findByUserId(id: string) {
    const customer = await this.prisma.customer.findUnique({
      where: {
        userId: id,
      },
      // include: {
      //   user: {
      //     select: {
      //       id: true,
      //       email: true,
      //     },
      //   },
      // },
    });
    return customer;
  }

  async findOne(id: string) {
    const customer = await this.prisma.customer.findUnique({
      where: {
        id,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });
    return customer;
  }

  async findOneByUser(id: string) {
    const customer = await this.prisma.customer.findUnique({
      where: {
        userId: id,
      },
    });
    return customer;
  }

  async update(id: string, updateCustomerDto: UpdateCustomerDto) {
    const customer = await this.prisma.customer.update({
      where: {
        id,
      },
      data: updateCustomerDto,
    });
    return customer;
  }

  async remove(id: string) {
    const customer = await this.prisma.customer.delete({
      where: {
        id,
      },
    });
    return customer;
  }
}
