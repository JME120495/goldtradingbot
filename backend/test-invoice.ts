import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { MailService } from './src/mail/mail.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const mailService = app.get(MailService);
  await mailService.sendInvoiceEmail(
    'essonojeanmarcel12@gmail.com',
    'Jean Marcel',
    'Gold Premium',
    199.99,
    'GTB_TEST_12345',
    'yearly',
    new Date()
  );
  console.log('Test email sent!');
  await app.close();
}

bootstrap();
