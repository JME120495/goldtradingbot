import { Module } from '@nestjs/common';
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

@Module({
  imports: [
    ScheduleModule.forRoot(),
    AuthModule,
    UsersModule,
    PrismaModule,
    Mt5Module,
    DownloadsModule,
    PaymentsModule,
    AffiliatesModule,
    CrmModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
