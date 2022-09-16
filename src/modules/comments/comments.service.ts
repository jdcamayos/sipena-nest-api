import { Injectable } from '@nestjs/common';
import { MailService } from 'src/libs/mail/mail.service';
import { PrismaService } from 'src/libs/prisma/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';

@Injectable()
export class CommentsService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
  ) {}
  async create(createCommentDto: CreateCommentDto) {
    const comment = await this.prisma.comment.create({
      data: createCommentDto,
      include: {
        author: {
          select: {
            email: true,
            role: true,
            image: true,
          },
        },
      },
    });
    console.log({
      content: comment.content,
      orderId: comment.orderId,
      author: comment.author.email,
      userId: comment.userId,
    });
    this.mailService
      .addCommentMail({
        content: comment.content,
        orderId: comment.orderId,
        author: comment.author.email,
        userId: comment.userId,
      })
      .then((res) => console.log(res))
      .catch((err) => console.log(err));
    return comment;
  }
}
