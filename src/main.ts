import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { PrismaService } from './libs/prisma/prisma.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Database
  const prismaService = app.get(PrismaService);
  await prismaService.enableShutdownHooks(app);
  // Validations
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
  // Documentation
  const docBuilder = new DocumentBuilder()
    .setTitle('Sipena Orders API')
    .setDescription('')
    .setVersion('1.0')
    .addTag('users')
    .build();
  const document = SwaggerModule.createDocument(app, docBuilder);
  SwaggerModule.setup('docs', app, document);

  await app.listen(3000);
}
bootstrap();
