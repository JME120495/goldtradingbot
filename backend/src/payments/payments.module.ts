import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { Mt5LicensesModule } from '../mt5-licenses/mt5-licenses.module';

@Module({
  imports: [Mt5LicensesModule],
  providers: [PaymentsService],
  controllers: [PaymentsController]
})
export class PaymentsModule {}
