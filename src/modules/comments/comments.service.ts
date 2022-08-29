import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/libs/prisma/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';

@Injectable()
export class CommentsService {
  constructor(private prisma: PrismaService) {}
  async create(createCommentDto: CreateCommentDto) {
    const comment = this.prisma.comment.create({
      data: createCommentDto,
    });
    return comment;
  }
}
