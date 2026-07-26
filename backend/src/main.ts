import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import * as express from 'express';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  // Validate required environment variables
  if (!process.env.DATABASE_URL) {
    console.warn('WARNING: DATABASE_URL is missing!');
  }
  if (!process.env.JWT_SECRET) {
    process.env.JWT_SECRET = 'g0ldtr4d1ng_s3cr3t_k3y_ch4ng3_m3_1n_pr0d';
  }
  if (!process.env.LICENSE_ADMIN_KEY) {
    process.env.LICENSE_ADMIN_KEY = 'a7f3c9e2b1d4068f5e7a9c3b2d1f4e6a8b0c2d4e6f8a1b3c5d7e9f0a2b4c6d8';
  }

  const app = await NestFactory.create(AppModule);
  
  // Security Headers
  app.use(helmet());

  // Cookie Parser
  app.use(cookieParser());

  // CORS configuration
  app.enableCors({
    origin: process.env.FRONTEND_URL ? [process.env.FRONTEND_URL, 'http://localhost:3000'] : 'http://localhost:3000',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  
  // Payload Size Limitation
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));

  // Validation
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  await app.listen(process.env.PORT ?? 3001, '0.0.0.0');
}
bootstrap();