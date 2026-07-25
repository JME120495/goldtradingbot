import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import * as express from 'express';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  // Validate required environment variables
  const requiredEnvVars = [
    'DATABASE_URL', 
    'JWT_SECRET', 
    'LICENSE_ADMIN_KEY', 
    'FRONTEND_URL',
    'EA_SECRET',
    'NOWPAYMENTS_IPN_SECRET',
    'ENCRYPTION_KEY'
  ];
  for (const envVar of requiredEnvVars) {
    if (process.env.NODE_ENV === 'production' && !process.env[envVar]) {
      throw new Error(`FATAL ERROR: ${envVar} is missing in production environment`);
    }
    
    // For other vars, if they are strictly required in all envs
    if (!process.env[envVar] && envVar !== 'FRONTEND_URL' && envVar !== 'ENCRYPTION_KEY') {
      throw new Error(`Missing required environment variable: ${envVar}`);
    }
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