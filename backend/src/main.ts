import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import * as express from 'express';
import cookieParser from 'cookie-parser';
import { randomBytes } from 'crypto';
import { AppModule } from './app.module';

async function bootstrap() {
  // Validate required environment variables
  if (!process.env.DATABASE_URL) {
    console.warn('WARNING: DATABASE_URL is missing!');
  }
  if (!process.env.JWT_SECRET) {
    // Random per-process secret: never a guessable hardcoded value.
    // Sessions are invalidated on restart until JWT_SECRET is set.
    console.warn('WARNING: JWT_SECRET is missing! Using a random secret.');
    process.env.JWT_SECRET = randomBytes(48).toString('hex');
  }

  const app = await NestFactory.create(AppModule, { rawBody: true });

  // Security Headers
  app.use(helmet());

  // Cookie Parser
  app.use(cookieParser());

  // CORS configuration
  app.enableCors({
    origin: process.env.FRONTEND_URL
      ? [process.env.FRONTEND_URL, 'http://localhost:3000']
      : 'http://localhost:3000',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Payload Size Limitation
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));

  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;
  await app.listen(port, '0.0.0.0');
  console.log(`Backend server is running on 0.0.0.0:${port}`);
}
bootstrap();
