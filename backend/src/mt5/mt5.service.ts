import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class Mt5Service {
  private readonly logger = new Logger(Mt5Service.name);

  constructor(private prisma: PrismaService) {}

  async checkLicense(data: any) {
    this.logger.log(`Checking license for account: ${data.account} / ${data.broker}`);
    
    // Find the trading account linked to the provided details
    // We relax the strict broker match because MT5 Terminal often sends long company names (e.g. "Exness Technologies Ltd") 
    // which don't match the short names from the frontend dropdown.
    const account = await this.prisma.tradingAccount.findFirst({
      where: {
        accountNumber: String(data.account),
      },
      include: {
        licenses: {
          where: {
            product: { slug: data.product },
            status: 'ACTIVE',
            OR: [
              { expiresAt: null },
              { expiresAt: { gt: new Date() } }
            ]
          },
          include: { plan: true },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!account || account.licenses.length === 0) {
      this.logger.warn(`License rejected for account ${data.account}`);
      return { active: false };
    }

    const activeLicense = account.licenses[0];
    
    this.logger.log(`License valid. Plan: ${activeLicense.plan.name}, Lot: ${activeLicense.lotAllowed}`);
    
    return {
      active: true,
      plan: activeLicense.plan.name,
      lot: activeLicense.lotAllowed,
      expiresAt: activeLicense.expiresAt ? activeLicense.expiresAt.toISOString().split('T')[0] : null
    };
  }

  async heartbeat(data: any) {
    // Logic to log active instances (could use Redis)
    return { status: 'ok' };
  }
}
