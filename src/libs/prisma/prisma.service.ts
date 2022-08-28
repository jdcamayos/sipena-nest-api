import { INestApplication, Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { hash } from 'bcrypt';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    super();
    this.$use(async (params, next) => {
      if (
        (params.action === 'create' || params.action === 'update') &&
        params.model === 'User' &&
        !!params.args.data.password
      ) {
        const user = params.args.data;
        const hashedPassword = await hash(user.password, 10);
        user.password = hashedPassword;
      }
      return await next(params);
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async enableShutdownHooks(app: INestApplication) {
    this.$on('beforeExit', async () => {
      await app.close();
    });
  }
}
