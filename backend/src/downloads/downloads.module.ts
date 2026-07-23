import { Module } from '@nestjs/common';
import { DownloadsService } from './downloads.service';
import { DownloadsController, LicensesController } from './downloads.controller';

@Module({
  providers: [DownloadsService],
  controllers: [DownloadsController, LicensesController]
})
export class DownloadsModule {}
