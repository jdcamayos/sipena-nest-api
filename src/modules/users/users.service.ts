import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/libs/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getMeta(params: {
    skip?: number;
    take?: number;
    where?: Prisma.UserWhereInput;
  }) {
    const { skip, take, where } = params;
    const count = await this.prisma.user.count({
      where,
    });
    return {
      page: skip / take + 1,
      pages: Math.ceil(count / take),
      itemsPerPage: take,
      totalItems: count,
    };
  }

  async create(createUserDto: CreateUserDto) {
    if (await this.findOneByEmail(createUserDto.email)) {
      throw new BadRequestException('Email is already registered');
    }
    const user = await this.prisma.user.create({
      data: createUserDto,
      select: {
        id: true,
        createdAt: true,
        updatedAt: true,
        email: true,
        role: true,
      },
    });
    return user;
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.UserWhereUniqueInput;
    where?: Prisma.UserWhereInput;
    orderBy?: Prisma.UserOrderByWithRelationInput;
  }) {
    const { skip, take, cursor, where, orderBy } = params;
    const defaultWhere = where
      ? where
      : {
          blocked: false,
        };
    const defaultOrder: Prisma.UserOrderByWithRelationInput = orderBy
      ? orderBy
      : {
          email: 'asc',
        };

    const findAllUsers = async () =>
      await this.prisma.user.findMany({
        select: {
          id: true,
          createdAt: true,
          updatedAt: true,
          email: true,
          role: true,
          blocked: true,
        },
        skip,
        take,
        cursor,
        where: defaultWhere,
        orderBy: defaultOrder,
      });
    const [data, meta] = await Promise.all([
      findAllUsers(),
      this.getMeta({ where: defaultWhere, skip, take }),
    ]);
    return { data, meta };
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        createdAt: true,
        updatedAt: true,
        email: true,
        role: true,
      },
    });
    return user;
  }

  async findOneByEmail(email: string, complete?: boolean) {
    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
      select: {
        id: true,
        createdAt: true,
        updatedAt: true,
        email: true,
        role: true,
        ...(complete && {
          password: true,
          resetPasswordToken: true,
          blocked: true,
        }),
      },
    });
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.prisma.user.update({
      where: {
        id,
      },
      data: updateUserDto,
      select: {
        id: true,
        createdAt: true,
        updatedAt: true,
        email: true,
        role: true,
        blocked: true,
      },
    });
    return user;
  }

  async assignRecoveryToken(id: string, resetPasswordToken: string) {
    const user = await this.prisma.user.update({
      where: {
        id,
      },
      data: {
        resetPasswordToken,
      },
      select: {
        id: true,
        resetPasswordToken: true,
      },
    });
    return user;
  }

  async updatePassword(id: string, password: string) {
    const user = await this.prisma.user.update({
      where: {
        id,
      },
      data: {
        resetPasswordToken: '',
        password,
      },
      select: {
        id: true,
        createdAt: true,
        updatedAt: true,
        email: true,
        role: true,
      },
    });
    return user;
  }

  async remove(id: string) {
    const user = await this.prisma.user.update({
      where: {
        id,
      },
      data: {
        blocked: true,
      },
      select: {
        id: true,
        createdAt: true,
        updatedAt: true,
        email: true,
        role: true,
      },
    });
    return user;
  }
}
