import 'reflect-metadata';
import { existsSync } from 'fs';
import { config as loadEnv } from 'dotenv';
import { resolve } from 'path';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

const envPath = resolve(__dirname, '../../../.env');
if (existsSync(envPath)) {
  loadEnv({ path: envPath });
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.enableCors({
    origin: process.env.CLIENT_URL ?? 'http://localhost:5173',
    credentials: true,
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`Server running on http://localhost:${port}/api`);
}

bootstrap();
