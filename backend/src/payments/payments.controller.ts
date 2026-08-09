import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Headers,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { AuthGuard } from '@nestjs/passport';
import { InitiatePaymentDto } from './dto/initiate-payment.dto';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post('initiate')
  async initiate(@Request() req, @Body() body: InitiatePaymentDto) {
    return this.paymentsService.initiatePayment(req.user.userId, body);
  }

  // Webhook is public (called by NowPayments server)
  @Post('webhook')
  async webhook(
    @Body() body: Record<string, any>,
    @Headers('x-nowpayments-sig') hash: string,
  ) {
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

    const computed = crypto
      .createHmac('sha512', secret)
      .update(JSON.stringify(sortedBody))
      .digest('hex');

    if (computed !== hash) {
      console.warn('Invalid webhook signature');
      return { status: 'error', message: 'Invalid signature' };
    }

    return this.paymentsService.handleWebhook(body);
  }

  // KPay Webhook
  @Post('kpay-webhook')
  async kpayWebhook(
    @Request() req,
    @Body() body: any,
    @Headers('x-kpay-signature') signature: string,
    @Headers('x-kpay-event') event: string
  ) {
    console.log('=== KPAY WEBHOOK RECEIVED ===');
    console.log('Event:', event);
    console.log('Signature present:', !!signature);
    console.log('Body:', JSON.stringify(body));
    console.log('rawBody available:', !!req.rawBody);
    
    if (!signature || !event) {
      console.log('REJECTED: Missing headers');
      return { status: 'error', message: 'Missing headers' };
    }

    // rawBody from NestJS { rawBody: true } option
    const rawBody = req.rawBody || Buffer.from(JSON.stringify(body));
    console.log('rawBody type:', typeof rawBody, 'isBuffer:', Buffer.isBuffer(rawBody));

    return this.paymentsService.handleKpayWebhook(rawBody, signature, event, body);
  }
}
