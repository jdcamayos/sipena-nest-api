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
      where: where
        ? where
        : {
            blocked: false,
          },
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
    const findAllUsers = async () =>
      await this.prisma.user.findMany({
        select: {
          id: true,
          createdAt: true,
          updatedAt: true,
          email: true,
          role: true,
        },
        skip,
        take,
        cursor,
        where: where
          ? where
          : {
              blocked: false,
            },
        orderBy,
      });
    const [results, meta] = await Promise.all([
      findAllUsers(),
      this.getMeta({ where, skip, take }),
    ]);
    return { results, meta };
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

  async findOneByEmail(email: string) {
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
