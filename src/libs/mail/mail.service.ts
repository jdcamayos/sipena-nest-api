import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { resolve } from 'path';
import { PrismaService } from '../prisma/prisma.service';
import { AddAttachmentDto } from './dto/add-attachment.dto';
import { AddCommentDto } from './dto/add-comment.dto';
import { NewOrderDto } from './dto/new-order.dto';
import { OrderFinishedDto } from './dto/order-finished.dto';
import { WorkerAssignedDto } from './dto/worker-assigned.dto';

@Injectable()
export class MailService {
  constructor(
    private mailerService: MailerService,
    private prisma: PrismaService,
    private config: ConfigService,
  ) {}

  async getEmails(orderId: string, author: string) {
    const owner = await this.prisma.order.findUnique({
      where: {
        id: orderId,
      },
      select: {
        customer: {
          select: {
            user: {
              select: {
                email: true,
              },
            },
          },
        },
      },
    });
    const admins = await this.prisma.user.findMany({
      where: {
        role: 'admin',
      },
      select: {
        email: true,
      },
    });
    const workers = await this.prisma.worker.findMany({
      where: {
        orderId,
      },
      select: {
        user: {
          select: {
            email: true,
          },
        },
      },
    });
    return [
      owner.customer.user.email !== author && owner.customer.user.email,
      ...admins.map((ad) => ad.email).filter((ad) => ad !== author),
      ...workers.map((wo) => wo.user.email).filter((wo) => wo !== author),
    ]
      .filter(Boolean)
      .join(', ');
  }

  async registerMail(email: string) {
    const link = this.config.get('FRONTEND_URL');
    return await this.mailerService.sendMail({
      to: email,
      subject: 'Greetings from Sipena Orders App',
      template: './register',
      context: {
        email,
        link,
      },
      attachments: [
        {
          filename: 'logoBlackHorizontal.png',
          path: resolve('public', 'assets', 'logoBlackHorizontal.png'),
          cid: 'logo',
        },
      ],
    });
  }

  async forgotPasswordMail(email: string, recoveryLink: string) {
    return await this.mailerService.sendMail({
      to: email,
      subject: 'Recovery your password',
      template: './forgot-password',
      context: {
        email,
        recoveryLink,
      },
      attachments: [
        {
          filename: 'logoBlackHorizontal.png',
          path: resolve('public', 'assets', 'logoBlackHorizontal.png'),
          cid: 'logo',
        },
      ],
    });
  }

  async newOrderMail(newOrderDto: NewOrderDto) {
    const { orderId } = newOrderDto;
    const author = (
      await this.prisma.order.findUnique({
        where: {
          id: orderId,
        },
        select: {
          customer: {
            select: {
              user: {
                select: {
                  email: true,
                },
              },
            },
          },
        },
      })
    ).customer.user.email;
    const link = `${this.config.get('FRONTEND_URL')}/orders/${orderId}`;
    const to = await this.getEmails(orderId, author);
    // console.log({
    //   to,
    //   subject: `New Order create`,
    //   context: {
    //     orderId,
    //   },
    //   preview: `
    //     <h1>New Order created</h1>
    //     <p>${author} has added new order</p>
    //     <p>content</p>
    //     <p>See more -> ${link}</p>
    //   `,
    // });
    return await this.mailerService.sendMail({
      to,
      subject: 'New order created',
      template: './new-order',
      context: {
        link,
        email: author,
        orderId,
      },
      attachments: [
        {
          filename: 'logoBlackHorizontal.png',
          path: resolve('public', 'assets', 'logoBlackHorizontal.png'),
          cid: 'logo',
        },
      ],
    });
  }

  async addCommentMail(addCommentDto: AddCommentDto) {
    const { content, orderId, author } = addCommentDto;
    const link = `${this.config.get('FRONTEND_URL')}/orders/${orderId}`;
    const to = await this.getEmails(orderId, author);
    // console.log({
    //   to,
    //   subject: `New comment in Order ${orderId}`,
    //   // template: './new-comment',
    //   context: {
    //     author,
    //     content,
    //     orderId,
    //     orderLink,
    //   },
    //   preview: `
    //     <h1>New Comment</h1>
    //     <p>${author} has added new comment to order ${orderId}</p>
    //     <p>${content}</p>
    //     <p>See more -> ${orderLink}</p>
    //   `,
    // });
    return await this.mailerService.sendMail({
      to,
      subject: `New comment added to Order ${orderId}`,
      template: './new-comment',
      context: {
        content,
        email: author,
        link,
      },
      attachments: [
        {
          filename: 'logoBlackHorizontal.png',
          path: resolve('public', 'assets', 'logoBlackHorizontal.png'),
          cid: 'logo',
        },
      ],
    });
  }

  async addAttachmentMail(addAttachmentDto: AddAttachmentDto) {
    const { filename, orderId, userId } = addAttachmentDto;
    const author = (
      await this.prisma.user.findUnique({
        where: {
          id: userId,
        },
        select: {
          email: true,
        },
      })
    ).email;
    const link = `${this.config.get('FRONTEND_URL')}/orders/${orderId}`;
    const to = await this.getEmails(orderId, author);
    // console.log({
    //   to,
    //   subject: `New attachment in Order ${orderId}`,
    //   // template: './new-attachment
    //   context: {
    //     author,
    //     filename,
    //     orderId,
    //     orderLink,
    //   },
    //   preview: `
    //     <h1>New Comment</h1>
    //     <p>${author} has added new comment to order ${orderId}</p>
    //     <p>${filename}</p>
    //     <p>See more -> ${orderLink}</p>
    //   `,
    // });
    return await this.mailerService.sendMail({
      to,
      subject: `New file added to Order ${orderId}`,
      template: './new-attachment',
      context: {
        email: author,
        filename,
        link,
      },
      attachments: [
        {
          filename: 'logoBlackHorizontal.png',
          path: resolve('public', 'assets', 'logoBlackHorizontal.png'),
          cid: 'logo',
        },
      ],
    });
  }

  async OrderCompleteMail(orderFinishedDto: OrderFinishedDto) {
    const { orderId, userId } = orderFinishedDto;
    const author = (
      await this.prisma.user.findUnique({
        where: {
          id: userId,
        },
        select: {
          email: true,
        },
      })
    ).email;
    const to = await this.getEmails(orderId, author);
    const link = `${this.config.get('FRONTEND_URL')}/orders/${orderId}`;
    // console.log({
    //   to,
    //   subject: `Order finished!`,
    //   // template: './',
    //   context: {
    //     orderId,
    //     orderLink,
    //   },
    //   preview: `
    //     <h1>Title</h1>
    //     <p>${author} has been finished and closed the order</p>
    //     <p>See more -> ${orderLink}</p>
    //   `,
    // });
    return await this.mailerService.sendMail({
      to,
      subject: `Order ${orderId} completed`,
      template: './order-completed',
      context: {
        email: author,
        link,
      },
      attachments: [
        {
          filename: 'logoBlackHorizontal.png',
          path: resolve('public', 'assets', 'logoBlackHorizontal.png'),
          cid: 'logo',
        },
      ],
    });
  }

  async workerAssignedMail(workerAssignedDto: WorkerAssignedDto) {
    const { assignedBy, orderId, userId } = workerAssignedDto;
    const author = (
      await this.prisma.user.findUnique({
        where: {
          id: assignedBy,
        },
        select: {
          email: true,
        },
      })
    ).email;
    const worker = (
      await this.prisma.user.findUnique({
        where: {
          id: userId,
        },
        select: {
          email: true,
        },
      })
    ).email;
    const link = `${this.config.get('FRONTEND_URL')}/orders/${orderId}`;
    // console.log({
    //   to: worker,
    //   subject: `New Order assigned!`,
    //   // template: './',
    //   context: {
    //     orderId,
    //     orderLink,
    //   },
    //   preview: `
    //     <h1>Title</h1>
    //     <p>${author} has been added an Order.</p>
    //     <p>See more -> ${orderLink}</p>
    //   `,
    // });
    return await this.mailerService.sendMail({
      to: worker,
      subject: `New order assigned`,
      template: './order-assigned',
      context: {
        email: author,
        link,
        orderId,
      },
      attachments: [
        {
          filename: 'logoBlackHorizontal.png',
          path: resolve('public', 'assets', 'logoBlackHorizontal.png'),
          cid: 'logo',
        },
      ],
    });
  }
}
