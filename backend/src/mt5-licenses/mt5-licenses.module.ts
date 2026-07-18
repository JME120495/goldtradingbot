import { Module } from '@nestjs/common';
import { Mt5LicensesService } from './mt5-licenses.service';
import { Mt5LicensesController } from './mt5-licenses.controller';

@Module({
  controllers: [Mt5LicensesController],
  providers: [Mt5LicensesService],
})
export class Mt5LicensesModule {}
