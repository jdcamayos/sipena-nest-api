import { Injectable } from '@nestjs/common';
import { MailService } from 'src/libs/mail/mail.service';
import { PrismaService } from 'src/libs/prisma/prisma.service';
import { CreateAttachmentDto } from './dto/create-attachment.dto';

@Injectable()
export class AttachmentsService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
  ) {}

  async create(createAttachmentDto: CreateAttachmentDto) {
    const attachment = await this.prisma.attachment.create({
      data: createAttachmentDto,
    });
    this.mailService.addAttachmentMail({
      userId: attachment.uploadBy,
      filename: attachment.originalname,
      orderId: attachment.orderId,
    });
    return attachment;
  }

  async createMany(createAttachmentDto: CreateAttachmentDto[]) {
    const attachments = await this.prisma.attachment.createMany({
      data: createAttachmentDto,
    });
    return attachments;
  }

  async remove(id: string) {
    const attachment = await this.prisma.attachment.update({
      where: {
        id,
      },
      data: {
        isDelete: true,
      },
    });
    return attachment;
  }
}
