import { PrismaClient } from '@prisma/client';
import { hash } from 'bcrypt';
import * as dotenv from 'dotenv';
dotenv.config({ path: __dirname + '/.env' });

const prisma = new PrismaClient();

const SEED_USERS = [
  {
    email: process.env.SEED_ADMIN_INIT_EMAIL,
    password: process.env.SEED_ADMIN_INIT_PASSWORD,
    role: 'admin',
  },
];

async function main() {
  // ...you wil write your Prisma Client queries here
  const usersAdded = await Promise.all(
    SEED_USERS.map(async (user) => {
      const hashedPassword = await hash(user.password, 10);
      const data = {
        ...user,
        password: hashedPassword,
      };
      return await prisma.user.create({
        data,
      });
    }),
  );
  console.log(usersAdded);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.log(e);
    await prisma.$disconnect();
    process.exit(1);
  });
