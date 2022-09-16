import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { PrismaService } from './libs/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
// import * as morgan from 'morgan';
import { Logger } from 'nestjs-pino';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: false,
  });
  // Loggers
  app.useLogger(app.get(Logger));
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
  // Logs
  // app.use(morgan('dev'));
  // Documentation
  const docBuilder = new DocumentBuilder()
    .setTitle('Sipena Orders API')
    .setDescription('')
    .setVersion('1.0')
    .addTag('auth')
    .addTag('customers')
    .addTag('orders')
    .addTag('ping')
    .addTag('uploads')
    .addTag('users')
    .build();
  const document = SwaggerModule.createDocument(app, docBuilder);
  SwaggerModule.setup('docs', app, document);
  // Configuration
  const config = app.get(ConfigService);
  app.enableCors();
  // Start
  await app.listen(config.get<number>('PORT') || 4000);
}
bootstrap();
