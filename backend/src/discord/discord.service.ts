import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class DiscordService {
  private readonly logger = new Logger(DiscordService.name);
  private readonly webhookUrl = process.env.DISCORD_WEBHOOK_URL;

  async sendMessage(message: string) {
    if (!this.webhookUrl) {
      this.logger.warn(
        'Discord webhook URL is missing. Notification not sent.',
      );
      return;
    }

    try {
      // Discord webhooks limit content to 2000 characters
      // We might want to remove HTML tags since Discord uses Markdown, but for now we'll send it as is
      // and maybe clean up some basic HTML tags like <b>
      const cleanMessage = message.replace(/<\/?b>/gi, '**');

      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: cleanMessage,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        this.logger.error(`Failed to send discord message: ${error}`);
      }
    } catch (err) {
      this.logger.error(`Error sending discord message: ${err.message}`);
    }
  }
}
