import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { Mt5LicensesModule } from '../mt5-licenses/mt5-licenses.module';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [Mt5LicensesModule, MailModule],
  providers: [PaymentsService],
  controllers: [PaymentsController],
})
export class PaymentsModule {}
