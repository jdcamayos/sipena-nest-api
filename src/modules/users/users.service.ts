import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/libs/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Prisma } from '@prisma/client';
import { UpdateMyPasswordDto } from './dto/update-my-password.dto';
import * as sharp from 'sharp';
import * as path from 'path';
import { v4 as uuid } from 'uuid';
import * as fs from 'fs';

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
        image: true,
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
    // const defaultWhere = where
    //   ? where
    //   : {
    //       blocked: false,
    //     };
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
        where,
        orderBy: defaultOrder,
      });
    const [data, meta] = await Promise.all([
      findAllUsers(),
      this.getMeta({ where, skip, take }),
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
        image: true,
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

  async updateMyPassword(id: string, updateMyPasswordDto: UpdateMyPasswordDto) {
    const user = await this.prisma.user.update({
      where: {
        id,
      },
      data: updateMyPasswordDto,
      select: {
        id: true,
        createdAt: true,
        updatedAt: true,
        email: true,
        role: true,
        image: true,
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

  async addImageToUser(userId: string, file: Express.Multer.File) {
    // const { image: imageExists } = await this.prisma.user.findUnique({
    //   where: {
    //     id: userId,
    //   },
    // });
    // if (!imageExists) {
    //   await fs.promises.unlink(path.resolve(imageExists));
    // }
    const imageBuffer = await fs.promises.readFile(file.path);
    const newName = uuid() + path.extname(file.originalname);
    const imagePath = path.join('public', userId, newName);
    const imageResized = await sharp(imageBuffer)
      .resize({ width: 300, height: 300, fit: 'cover' })
      .toBuffer();
    await fs.promises.writeFile(imagePath, imageResized);
    // await fs.promises.unlink(path.resolve(file.path));
    const user = await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        image: imagePath,
      },
      select: {
        id: true,
        createdAt: true,
        updatedAt: true,
        email: true,
        role: true,
        image: true,
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
        image: true,
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
        image: true,
      },
    });
    return user;
  }
}
