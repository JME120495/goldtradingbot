import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  // Validate required environment variables
  const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET', 'LICENSE_ADMIN_KEY', 'NOWPAYMENTS_API_KEY', 'NOWPAYMENTS_IPN_SECRET', 'FRONTEND_URL'];
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      throw new Error(`Missing required environment variable: ${envVar}`);
    }
  }

  const app = await NestFactory.create(AppModule);
  app.enableCors();
  await app.listen(process.env.PORT ?? 3001, '0.0.0.0');
}
bootstrap();