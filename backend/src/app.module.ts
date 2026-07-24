import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PrismaModule } from './prisma/prisma.module';
import { Mt5Module } from './mt5/mt5.module';
import { DownloadsModule } from './downloads/downloads.module';
import { PaymentsModule } from './payments/payments.module';
import { AffiliatesModule } from './affiliates/affiliates.module';
import { CrmModule } from './crm/crm.module';
import { ScheduleModule } from '@nestjs/schedule';
import { AdminModule } from './admin/admin.module';
import { TradingAccountsModule } from './trading-accounts/trading-accounts.module';
import { Mt5LicensesModule } from './mt5-licenses/mt5-licenses.module';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { TelemetryModule } from './telemetry/telemetry.module';
import { SupportModule } from './support/support.module';
import { TelegramModule } from './telegram/telegram.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([{
      ttl: 60000,   // 60 seconds
      limit: 30,    // 30 requests per window (default, overridden per-route)
    }]),
    AuthModule,
    UsersModule,
    PrismaModule,
    Mt5Module,
    DownloadsModule,
    PaymentsModule,
    AffiliatesModule,
    CrmModule,
    AdminModule,
    TradingAccountsModule,
    Mt5LicensesModule,
    TelemetryModule,
    SupportModule,
    TelegramModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
