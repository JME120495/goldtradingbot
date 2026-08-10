import { Module } from '@nestjs/common';
import { WhatsappBotController } from './whatsapp-bot.controller';
import { WhatsappBotService } from './whatsapp-bot.service';

@Module({
  controllers: [WhatsappBotController],
  providers: [WhatsappBotService],
  exports: [WhatsappBotService],
})
export class WhatsappBotModule {}
