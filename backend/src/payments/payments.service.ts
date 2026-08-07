import {
  Injectable,
  Logger,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Mt5LicensesService } from '../mt5-licenses/mt5-licenses.service';
import { TelegramService } from '../telegram/telegram.service';
import { DiscordService } from '../discord/discord.service';
import { MailService } from '../mail/mail.service';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  // Flutterwave secret from environment variable
  private readonly FLUTTERWAVE_SECRET = process.env.FLUTTERWAVE_SECRET;

  constructor(
    private prisma: PrismaService,
    private mt5LicensesService: Mt5LicensesService,
    private telegram: TelegramService,
    private discord: DiscordService,
    private mail: MailService,
  ) {}

  async initiatePayment(
    userId: string,
    data: { productId: string; planId: string; duration: string; method?: string; phoneNumber?: string; provider?: string },
  ) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const plan = await this.prisma.productPlan.findUnique({
      where: { id: data.planId },
    });
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
        provider: data.method === 'MOBILE_MONEY' ? 'KPAY' : 'NOWPAYMENTS',
        providerTxId: txRef,
        status: 'PENDING',
      },
    });

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const apiKey = process.env.NOWPAYMENTS_API_KEY;

    // MODE TEST: Si la clé API manque, on simule le paiement pour les tests
    if (!apiKey || apiKey === 'test') {
      this.logger.log(
        'MODE TEST: NOWPAYMENTS_API_KEY absente. Simulation du paiement et création de la licence...',
      );

      await this.prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'COMPLETED' },
      });

      let days = 30;
      if (data.duration === 'weekly') days = 7;
      else if (data.duration === 'monthly') days = 30;
      else if (data.duration === 'semiAnnual') days = 182;
      else if (data.duration === 'yearly') days = 365;

      await this.prisma.license.create({
        data: {
          userId: payment.userId,
          productId: data.productId,
          planId: data.planId,
          status: 'ACTIVE',
          lotAllowed: plan.lotAllowed,
          expiresAt: new Date(Date.now() + days * 24 * 60 * 60 * 1000),
        },
      });

      // Synchronize to MT5 standalone table
      await this.mt5LicensesService.syncUserToMt5Licenses(payment.userId);

      // Handle Affiliate Commission
      const purchasingUser = await this.prisma.user.findUnique({
        where: { id: payment.userId },
      });
      if (purchasingUser?.referredById) {
        const commissionRate = data.duration === 'weekly' ? 0.15 : 0.1;
        const commission = amount * commissionRate;
        await this.prisma.affiliateSale.create({
          data: {
            affiliateId: purchasingUser.referredById,
            amount: amount,
            commission: commission,
            isRenewal: false,
          },
        });
      }

      if (purchasingUser?.email) {
        await this.mail.sendInvoiceEmail(
          purchasingUser.email,
          purchasingUser.name || '',
          plan.name,
          amount,
          txRef,
          data.duration,
          new Date(),
        );
      }

      this.telegram.sendMessage(
        `💰 <b>Nouvelle Vente ! (Mode Test)</b>\n\n<b>Plan:</b> ${plan.name} (${data.duration})\n<b>Montant:</b> $${amount}\n<b>Client ID:</b> ${payment.userId}`,
      );
      this.discord.sendMessage(
        `💰 **Nouvelle Vente ! (Mode Test)**\n\n**Plan:** ${plan.name} (${data.duration})\n**Montant:** $${amount}\n**Client ID:** ${payment.userId}`,
      );

      return {
        paymentLink: `${frontendUrl}/dashboard?payment=success_simulated`,
      };
    }

    // --- VRAI PAIEMENT KPAY ---
    if (data.method === 'MOBILE_MONEY') {
      return this.initiateKPay(user, plan, payment, amount, txRef, data.duration, data);
    }

    // --- VRAI PAIEMENT NOWPAYMENTS ---
    if (!frontendUrl) {
      throw new InternalServerErrorException(
        'FRONTEND_URL environment variable is required',
      );
    }

    const backendUrl = process.env.BACKEND_URL;

    const invoicePayload: Record<string, any> = {
      price_amount: amount,
      price_currency: 'usd',
      order_id: txRef,
      order_description: `Licence Robot - Plan ${plan.name} (${data.duration})`,
      success_url: `${frontendUrl}/dashboard?payment=success`,
      cancel_url: `${frontendUrl}/dashboard?payment=cancelled`,
    };

    if (backendUrl) {
      invoicePayload.ipn_callback_url = `${backendUrl.replace(/\/$/, '')}/payments/webhook`;
    }

    // On utilise fetch (natif NodeJS 18+)
    const response = await fetch('https://api.nowpayments.io/v1/invoice', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(invoicePayload),
    });

    if (!response.ok) {
      const errText = await response.text();
      this.logger.error(`NowPayments API error: ${errText}`);
      throw new InternalServerErrorException(
        `Erreur NowPayments: ${errText || 'Facture crypto échouée'}`,
      );
    }

    const npData = await response.json();

    return {
      paymentLink: npData.invoice_url,
    };
  }

  async handleWebhook(payload: any) {
    this.logger.log(`Received Webhook: ${JSON.stringify(payload)}`);

    // NowPayments envoie payment_status
    // Seuls 'finished' (paiement complet) et 'confirmed' sont considérés comme un succès final.
    if (
      payload.payment_status === 'finished' ||
      payload.payment_status === 'confirmed'
    ) {
      const txRef = payload.order_id;

      const payment = await this.prisma.payment.findUnique({
        where: { providerTxId: txRef },
      });
      if (!payment) return { status: 'ignored' };

      // Vérification d'idempotence : on s'assure qu'on ne traite qu'une seule fois
      if (payment.status === 'COMPLETED') {
        this.logger.log(
          `Webhook ignoré : Le paiement ${txRef} est déjà traité.`,
        );
        return { status: 'already_processed' };
      }

      // VÉRIFICATION DU MONTANT (Double Check de Sécurité)
      const expectedAmount = payment.amount;
      const receivedAmount = payload.price_amount; // Le montant en USD enregistré par NowPayments

      if (receivedAmount < expectedAmount) {
        this.logger.error(
          `Alerte de sécurité : Montant payé insuffisant. Attendu : ${expectedAmount}, Reçu : ${receivedAmount}`,
        );
        await this.prisma.payment.update({
          where: { id: payment.id },
          data: { status: 'AMOUNT_MISMATCH' },
        });
        return { status: 'amount_mismatch' };
      }

      // Update Payment Status
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'COMPLETED' },
      });

      // Extraire les infos de la référence (GTB_timestamp_productId_planId_duration)
      const parts = txRef.split('_');
      if (parts.length >= 5) {
        const productId = parts[2];
        const planId = parts[3];
        const duration = parts[4];

        const plan = await this.prisma.productPlan.findUnique({
          where: { id: planId },
        });

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
            expiresAt: new Date(Date.now() + days * 24 * 60 * 60 * 1000),
          },
        });

        // Synchronize to MT5 standalone table
        await this.mt5LicensesService.syncUserToMt5Licenses(payment.userId);

        // Handle Affiliate Commission
        const purchasingUser = await this.prisma.user.findUnique({
          where: { id: payment.userId },
        });
        if (purchasingUser?.referredById && plan) {
          const commissionRate = duration === 'weekly' ? 0.15 : 0.1;
          const commission = payment.amount * commissionRate;
          await this.prisma.affiliateSale.create({
            data: {
              affiliateId: purchasingUser.referredById,
              amount: payment.amount,
              commission: commission,
              isRenewal: false,
            },
          });
        }
        this.logger.log(`License created for user ${payment.userId}`);

        if (purchasingUser?.email && plan) {
          await this.mail.sendInvoiceEmail(
            purchasingUser.email,
            purchasingUser.name || '',
            plan.name,
            payment.amount,
            txRef,
            duration,
            new Date(),
          );
        }

        this.telegram.sendMessage(
          `💰 <b>Nouvelle Vente !</b>\n\n<b>Plan:</b> ${plan?.name || 'Inconnu'} (${duration})\n<b>Montant:</b> $${payment.amount}\n<b>Client ID:</b> ${payment.userId}\n<b>TxID:</b> ${txRef}`,
        );
        this.discord.sendMessage(
          `💰 **Nouvelle Vente !**\n\n**Plan:** ${plan?.name || 'Inconnu'} (${duration})\n**Montant:** $${payment.amount}\n**Client ID:** ${payment.userId}\n**TxID:** ${txRef}`,
        );
      }
    } else if (payload.payment_status === 'partially_paid') {
      const txRef = payload.order_id;
      const payment = await this.prisma.payment.findUnique({
        where: { providerTxId: txRef },
      });
      if (payment) {
        await this.prisma.payment.update({
          where: { id: payment.id },
          data: { status: 'PARTIALLY_PAID' },
        });
      }
    } else if (payload.payment_status === 'refunded') {
      const txRef = payload.order_id;
      const payment = await this.prisma.payment.findUnique({
        where: { providerTxId: txRef },
      });
      if (payment) {
        await this.prisma.payment.update({
          where: { id: payment.id },
          data: { status: 'REFUNDED' },
        });
      }
    } else if (
      payload.payment_status === 'failed' ||
      payload.payment_status === 'expired'
    ) {
      const txRef = payload.order_id;
      const payment = await this.prisma.payment.findUnique({
        where: { providerTxId: txRef },
      });
      if (payment) {
        await this.prisma.payment.update({
          where: { id: payment.id },
          data: { status: 'FAILED' },
        });
      }
    }

    return { status: 'success' };
  }

  // --- KPAY INTEGRATION ---

  // Map provider code -> country dial code
  private getCountryCode(provider: string): string {
    const map: Record<string, string> = {
      'MTN_MOMO_CMR': '237',
      'ORANGE_CMR': '237',
      'MTN_MOMO_CI': '225',
      'ORANGE_CI': '225',
      'WAVE_CI': '225',
      'MOOV_CI': '225',
      'AIRTEL_GAB': '241',
      'MOOV_GAB': '241',
      'MTN_MOMO_BEN': '229',
      'MOOV_BEN': '229',
      'WAVE_SEN': '221',
      'ORANGE_SEN': '221',
      'FREE_SEN': '221',
      'MTN_MOMO_COG': '242',
      'AIRTEL_COG': '242',
    };
    return map[provider] || '';
  }
  
  private async initiateKPay(user: any, plan: any, payment: any, amountUSD: number, txRef: string, duration: string, data: any) {
    const apiKey = process.env.KPAY_API_KEY;
    const secretKey = process.env.KPAY_SECRET_KEY;

    if (!apiKey || !secretKey) {
      throw new InternalServerErrorException('Clés API KPay manquantes');
    }

    if (!data.phoneNumber || !data.provider) {
      throw new InternalServerErrorException('Numéro de téléphone et opérateur requis pour le paiement Mobile Money');
    }

    // Auto-prefix country code if the user didn't include it
    let phoneNumber = data.phoneNumber.replace(/\s+/g, '').replace(/^\+/, '');
    const countryCode = this.getCountryCode(data.provider);
    if (countryCode && !phoneNumber.startsWith(countryCode)) {
      phoneNumber = countryCode + phoneNumber;
    }

    // Conversion manuelle: 1 USD = 600 XAF (zone CEMAC/UEMOA)
    const exchangeRate = 600;
    const amountXAF = Math.round(amountUSD * exchangeRate);

    const payload = {
      amount: amountXAF,
      provider: data.provider,
      phoneNumber: phoneNumber,
      externalId: txRef,
      description: `Licence Robot - Plan ${plan.name} (${duration})`,
      customerName: user.name || 'Client',
      customerEmail: user.email,
      metadata: { userId: user.id }
    };

    this.logger.log(`KPay init payload: ${JSON.stringify(payload)}`);

    try {
      const response = await fetch('https://admin.kpay.site/api/v1/payments/init', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-API-Key': apiKey,
          'X-Secret-Key': secretKey
        },
        body: JSON.stringify(payload),
      });

      const resData = await response.json();
      this.logger.log(`KPay init response (${response.status}): ${JSON.stringify(resData)}`);
      
      if (response.ok) {
        return { paymentStatus: 'PENDING', message: 'Veuillez valider le paiement sur votre téléphone.' };
      } else {
        this.logger.error(`KPay init error: ${JSON.stringify(resData)}`);
        throw new InternalServerErrorException(`Erreur KPay: ${resData.message || resData.error || 'Paiement échoué'}`);
      }
    } catch (err: any) {
      if (err instanceof InternalServerErrorException) throw err;
      this.logger.error(`Error calling KPay: ${err.message}`);
      throw new InternalServerErrorException(`Erreur Mobile Money: ${err.message}`);
    }
  }

  async handleKpayWebhook(rawBody: Buffer | string, signature: string, eventName: string, parsedBody: any) {
    this.logger.log(`KPay webhook received for event: ${eventName}`);
    
    const secretKey = process.env.KPAY_SECRET_KEY;
    if (!secretKey) return { status: 'error', message: 'Missing API keys' };

    const crypto = require('crypto');
    const expectedSignature = crypto
      .createHmac('sha256', secretKey)
      .update(rawBody)
      .digest('hex');

    if (signature !== expectedSignature) {
      this.logger.warn('KPay signature invalide');
      return { status: 'error', message: 'Invalid signature' };
    }

    const payload = parsedBody;

    if (eventName !== 'payment.completed' || payload.status !== 'COMPLETED') {
       if (payload.status === 'FAILED' || payload.status === 'CANCELLED') {
         const txRef = payload.externalId;
         const payment = await this.prisma.payment.findUnique({ where: { providerTxId: txRef } });
         if (payment && payment.status === 'PENDING') {
            await this.prisma.payment.update({
              where: { id: payment.id },
              data: { status: payload.status }
            });
         }
       }
       return { status: 'ignored' };
    }

    const txRef = payload.externalId;
    const payment = await this.prisma.payment.findUnique({ where: { providerTxId: txRef } });
    if (!payment) return { status: 'ignored', message: 'Payment not found' };

    if (payment.status === 'COMPLETED') {
      return { status: 'already_processed' };
    }

    // Mark payment as completed
    await this.prisma.payment.update({
      where: { id: payment.id },
      data: { status: 'COMPLETED' },
    });

    // Extract info from txRef (GTB_timestamp_productId_planId_duration)
    const parts = txRef.split('_');
    if (parts.length >= 5) {
      const productId = parts[2];
      const planId = parts[3];
      const duration = parts[4];

      const plan = await this.prisma.productPlan.findUnique({ where: { id: planId } });

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
          expiresAt: new Date(Date.now() + days * 24 * 60 * 60 * 1000),
        },
      });

      await this.mt5LicensesService.syncUserToMt5Licenses(payment.userId);

      // Handle Affiliate Commission
      const purchasingUser = await this.prisma.user.findUnique({ where: { id: payment.userId } });
      if (purchasingUser?.referredById && plan) {
        const commissionRate = duration === 'weekly' ? 0.15 : 0.1;
        const commission = payment.amount * commissionRate;
        await this.prisma.affiliateSale.create({
          data: {
            affiliateId: purchasingUser.referredById,
            amount: payment.amount,
            commission: commission,
            isRenewal: false,
          },
        });
      }
      this.logger.log(`License created for user ${payment.userId} via KPay`);

      if (purchasingUser?.email && plan) {
        await this.mail.sendInvoiceEmail(
          purchasingUser.email,
          purchasingUser.name || '',
          plan.name,
          payment.amount,
          txRef,
          duration,
          new Date(),
        );
      }

      this.telegram.sendMessage(
        `📱 <b>Nouvelle Vente (Mobile Money) !</b>\n\n<b>Plan:</b> ${plan?.name || 'Inconnu'} (${duration})\n<b>Montant:</b> $${payment.amount}\n<b>Client ID:</b> ${payment.userId}`,
      );
      this.discord.sendMessage(
        `📱 **Nouvelle Vente (Mobile Money) !**\n\n**Plan:** ${plan?.name || 'Inconnu'} (${duration})\n**Montant:** $${payment.amount}\n**Client ID:** ${payment.userId}`,
      );
    }

    return { status: 'success' };
  }
}
