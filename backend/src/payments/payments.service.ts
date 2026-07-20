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

    // Générer une référence unique contenant les infos nécessaires
    // Format: GTB_timestamp_productId_planId_duration
    const txRef = `GTB_${Date.now()}_${data.productId}_${data.planId}_${data.duration}`;

    // 1. Create PENDING payment in DB
    const payment = await this.prisma.payment.create({
      data: {
        userId,
        amount,
        currency: 'USD',
        provider: 'NOWPAYMENTS',
        providerTxId: txRef,
        status: 'PENDING',
      }
    });

    // 2. Call NowPayments API
    const frontendUrl = process.env.FRONTEND_URL;
    if (!frontendUrl) {
      throw new Error('FRONTEND_URL environment variable is required');
    }

    const apiKey = process.env.NOWPAYMENTS_API_KEY;
    if (!apiKey) throw new Error('NOWPAYMENTS_API_KEY is required');

    // On utilise fetch (natif NodeJS 18+)
    const response = await fetch('https://api.nowpayments.io/v1/invoice', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        price_amount: amount,
        price_currency: 'usd',
        order_id: txRef,
        order_description: `Licence Robot - Plan ${plan.name} (${data.duration})`,
        success_url: `${frontendUrl}/dashboard`,
        cancel_url: frontendUrl,
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      this.logger.error(`NowPayments API error: ${errText}`);
      throw new Error('Erreur lors de la création de la facture crypto');
    }

    const npData = await response.json();

    return {
      paymentLink: npData.invoice_url
    };
  }

  async handleWebhook(payload: any) {
    this.logger.log(`Received Webhook: ${JSON.stringify(payload)}`);
    
    // NowPayments envoie payment_status
    // Seuls 'finished' (paiement complet) et 'confirmed' sont considérés comme un succès final.
    if (payload.payment_status === 'finished' || payload.payment_status === 'confirmed') {
      const txRef = payload.order_id;
      
      const payment = await this.prisma.payment.findUnique({ where: { providerTxId: txRef } });
      if (!payment) return { status: 'ignored' };

      // Vérification d'idempotence : on s'assure qu'on ne traite qu'une seule fois
      if (payment.status === 'COMPLETED') {
        this.logger.log(`Webhook ignoré : Le paiement ${txRef} est déjà traité.`);
        return { status: 'already_processed' };
      }

      // Update Payment Status
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'COMPLETED' }
      });

      // Extraire les infos de la référence (GTB_timestamp_productId_planId_duration)
      const parts = txRef.split('_');
      if (parts.length >= 5) {
        const productId = parts[2];
        const planId = parts[3];
        const duration = parts[4];

        const plan = await this.prisma.productPlan.findUnique({ where: { id: planId }});
        
        // Calculate expiration date based on duration
        let days = 30;
        if (duration === 'weekly') days = 7;
        else if (duration === 'monthly') days = 30;
        else if (duration === 'semiAnnual') days = 182;
        else if (duration === 'yearly') days = 365;

        await this.prisma.license.create({
          data: {
            userId: payment.userId,
            productId: productId,
            planId: planId,
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
