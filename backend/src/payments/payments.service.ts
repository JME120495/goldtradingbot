import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  
  // Flutterwave secret from environment variable
  private readonly FLUTTERWAVE_SECRET = process.env.FLUTTERWAVE_SECRET;

  constructor(private prisma: PrismaService) {}

  async initiatePayment(userId: string, data: { productId: string, planId: string, duration: string }) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const plan = await this.prisma.productPlan.findUnique({ where: { id: data.planId } });
    if (!plan) throw new NotFoundException('Plan not found');

    // Parse prices
    const prices = JSON.parse(plan.prices);
    const amount = prices[data.duration] || prices['monthly'];

    // MOCK: Generate a unique transaction reference
    const txRef = `GTB-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // 1. Create PENDING payment in DB
    const payment = await this.prisma.payment.create({
      data: {
        userId,
        amount,
        currency: 'USD',
        provider: 'FLUTTERWAVE',
        providerTxId: txRef,
        status: 'PENDING',
      }
    });

    // 2. Call Flutterwave API (Mocked logic)
    // Return a mocked payment link passing metadata in URL for mock webhook to use
    const frontendUrl = process.env.FRONTEND_URL;
    if (!frontendUrl) {
      throw new Error('FRONTEND_URL environment variable is required');
    }
    return {
      paymentLink: `${frontendUrl}/checkout/mock-flutterwave?tx_ref=${txRef}&amount=${amount}&productId=${data.productId}&planId=${data.planId}&duration=${data.duration}`
    };
  }

  async handleWebhook(payload: any) {
    this.logger.log(`Received Webhook: ${JSON.stringify(payload)}`);
    
    // Check if payment was successful
    if (payload.event === 'charge.completed' && payload.data.status === 'successful') {
      const txRef = payload.data.tx_ref;
      
      const payment = await this.prisma.payment.findUnique({ where: { providerTxId: txRef } });
      if (!payment) return { status: 'ignored' };

      // Update Payment Status
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'COMPLETED' }
      });

      // Create License
      const meta = payload.data.meta;
      if (meta && meta.productId && meta.planId) {
        const plan = await this.prisma.productPlan.findUnique({ where: { id: meta.planId }});
        
        // Calculate expiration date based on duration
        const duration = meta.duration || 'monthly';
        let days = 30;
        if (duration === 'weekly') days = 7;
        else if (duration === 'monthly') days = 30;
        else if (duration === 'semiAnnual') days = 182;
        else if (duration === 'yearly') days = 365;

        await this.prisma.license.create({
          data: {
            userId: payment.userId,
            productId: meta.productId,
            planId: meta.planId,
            status: 'ACTIVE',
            lotAllowed: plan ? plan.lotAllowed : 0.01,
            expiresAt: new Date(Date.now() + days * 24 * 60 * 60 * 1000) 
          }
        });
        this.logger.log(`License created for user ${payment.userId}`);
      }
    }
    
    return { status: 'success' };
  }
}
