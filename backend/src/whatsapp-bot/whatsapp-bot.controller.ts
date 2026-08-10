import { Controller, Post, Get, Body, Query, Req, Res, HttpStatus } from '@nestjs/common';
import { WhatsappBotService } from './whatsapp-bot.service';
import type { Request, Response } from 'express';

@Controller('api/whatsapp')
export class WhatsappBotController {
  constructor(private readonly whatsappBotService: WhatsappBotService) {}

  // ----------------------------------------------------------
  // GET /api/whatsapp/webhook
  // Used by Meta to verify the webhook URL
  // ----------------------------------------------------------
  @Get('webhook')
  verifyWebhook(@Query() query: any, @Res() res: Response) {
    const mode = query['hub.mode'];
    const token = query['hub.verify_token'];
    const challenge = query['hub.challenge'];
    
    // You set this token in Meta Developer Dashboard and in your .env
    const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN || 'my_custom_verify_token_123';

    if (mode && token) {
      if (mode === 'subscribe' && token === verifyToken) {
        return res.status(HttpStatus.OK).send(challenge);
      } else {
        return res.sendStatus(HttpStatus.FORBIDDEN);
      }
    }
    
    return res.status(HttpStatus.BAD_REQUEST).send('Invalid request');
  }

  // ----------------------------------------------------------
  // POST /api/whatsapp/webhook
  // Used by Meta to send incoming messages and events
  // ----------------------------------------------------------
  @Post('webhook')
  async handleWebhook(@Body() body: any, @Res() res: Response) {
    console.log('--- INCOMING WEBHOOK FROM META ---');
    console.log(JSON.stringify(body, null, 2));
    
    // Acknowledge receipt to Meta immediately (they expect 200 OK within 20 seconds)
    res.sendStatus(HttpStatus.OK);
    
    // Process the message asynchronously
    await this.whatsappBotService.handleIncomingMessage(body);
  }
}
