import { Module } from '@nestjs/common';
import { TradingAccountsController } from './trading-accounts.controller';
import { TradingAccountsService } from './trading-accounts.service';
import { Mt5LicensesModule } from '../mt5-licenses/mt5-licenses.module';

@Module({
  imports: [Mt5LicensesModule],
  controllers: [TradingAccountsController],
  providers: [TradingAccountsService]
})
export class TradingAccountsModule {}
