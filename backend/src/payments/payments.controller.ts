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

  // Webhook is public (called by NowPayments server)
  @Post('webhook')
  async webhook(@Body() body: any, @Headers('x-nowpayments-sig') hash: string) {
    const secret = process.env.NOWPAYMENTS_IPN_SECRET;
    if (!secret) {
      throw new Error('NOWPAYMENTS_IPN_SECRET not defined');
    }
    
    if (!hash) {
      return { status: 'error', message: 'No signature provided' };
    }

    const crypto = require('crypto');
    
    // NowPayments requires sorting keys alphabetically before stringifying
    const sortedBody = Object.keys(body)
      .sort()
      .reduce((obj, key) => {
        obj[key] = body[key];
        return obj;
      }, {});

    const computed = crypto.createHmac('sha512', secret).update(JSON.stringify(sortedBody)).digest('hex');
    
    if (computed !== hash) {
      console.warn('Invalid webhook signature');
      return { status: 'error', message: 'Invalid signature' };
    }
    
    return this.paymentsService.handleWebhook(body);
  }
}
