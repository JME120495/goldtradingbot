import { Controller, Post, Body, UseGuards, Request, Headers } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post('initiate')
  async initiate(@Request() req, @Body() body: { productId: string, planId: string, duration: string }) {
    return this.paymentsService.initiatePayment(req.user.userId, body);
  }

  // Webhook is public (called by Flutterwave server)
  @Post('webhook')
  async webhook(@Body() body: any, @Headers('verif-hash') hash: string) {
    const secret = process.env.FLUTTERWAVE_SECRET;
    if (!secret) {
      throw new Error('FLUTTERWAVE_SECRET not defined');
    }
    const crypto = require('crypto');
    const computed = crypto.createHmac('sha256', secret).update(JSON.stringify(body)).digest('hex');
    // constant-time compare
    const buf1 = Buffer.from(hash, 'hex');
    const buf2 = Buffer.from(computed, 'hex');
    const isValid = crypto.timingSafeEqual(buf1, buf2);
    if (!isValid) {
      console.warn('Invalid webhook signature');
      return { status: 'error', message: 'Invalid signature' };
    }
    return this.paymentsService.handleWebhook(body);
  }
}
