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
    // In prod, check the verif-hash with your Flutterwave secret hash
    return this.paymentsService.handleWebhook(body);
  }
}
