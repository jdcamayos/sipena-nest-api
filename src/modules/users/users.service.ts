import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/libs/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

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
    const users = await this.prisma.user.findMany({
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
    return users;
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
