import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class TelegramService {
  private readonly logger = new Logger(TelegramService.name);
  private readonly token = process.env.TELEGRAM_BOT_TOKEN;
  private readonly chatId = process.env.TELEGRAM_CHAT_ID;

  async sendMessage(message: string) {
    if (!this.token || !this.chatId) {
      this.logger.warn('Telegram bot token or chat ID is missing. Notification not sent.');
      return;
    }

    try {
      const url = `https://api.telegram.org/bot${this.token}/sendMessage`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: this.chatId,
          text: message,
          parse_mode: 'HTML',
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        this.logger.error(`Failed to send telegram message: ${error}`);
      }
    } catch (err) {
      this.logger.error(`Error sending telegram message: ${err.message}`);
    }
  }
}
