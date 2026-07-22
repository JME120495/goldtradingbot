import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMt5LicenseDto } from './dto/create-mt5-license.dto';
import { SyncHistoryDto } from './dto/sync-history.dto';

@Injectable()
export class Mt5LicensesService {
  private readonly logger = new Logger(Mt5LicensesService.name);

  constructor(private prisma: PrismaService) {}

  // ----------------------------------------------------------
  //  Verify — called by the EA (public endpoint)
  //  Returns ONLY non-sensitive data: valid, plan, lot, expiry, message
  // ----------------------------------------------------------
  async syncUserToMt5Licenses(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        tradingAccounts: true,
        licenses: {
          where: { status: 'ACTIVE' },
          include: { plan: true, product: true },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!user) return;

    for (const account of user.tradingAccounts) {
      const webLicense = user.licenses.find(l => {
        if (!l.expiresAt) return true;
        return l.expiresAt > new Date();
      });

      if (webLicense) {
        const eaName = webLicense.product.slug;
        const accountNumber = BigInt(account.accountNumber);
        
        // If web license found, upsert an Mt5License to keep the robot working
        await this.prisma.mt5License.upsert({
          where: {
            accountNumber_eaName: { accountNumber, eaName },
          },
          create: {
            clientName: user.name || 'Client Web',
            clientEmail: user.email,
            accountNumber,
            broker: account.broker,
            server: account.server || '',
            eaName,
            plan: webLicense.plan.name,
            lot: webLicense.lotAllowed,
            status: 'active',
            expiryDate: webLicense.expiresAt || new Date('2099-12-31'),
          },
          update: {
            clientName: user.name || 'Client Web',
            clientEmail: user.email,
            broker: account.broker,
            server: account.server || '',
            plan: webLicense.plan.name,
            lot: webLicense.lotAllowed,
            status: 'active',
            expiryDate: webLicense.expiresAt || new Date('2099-12-31'),
          },
        });
      }
    }
  }

  async verifyLicense(
    account: number,
    broker: string | undefined,
    server: string | undefined,
    ea: string | undefined,
    clientIp: string,
  ) {
    const eaName = ea || 'ALL';

    // Find license for this account, either specific to the EA or 'ALL'.
    // Prioritise exact EA match over 'ALL'.
    const licenses = await this.prisma.mt5License.findMany({
      where: {
        accountNumber: BigInt(account),
        eaName: { in: [eaName, 'ALL'] },
      },
      orderBy: { eaName: 'desc' }, // exact match ('JMEGOLD_DUAL') > 'ALL'
      take: 2,
    });

    // Pick the best match: prefer exact EA name over 'ALL'
    const lic =
      licenses.find((l) => l.eaName === eaName) ||
      licenses.find((l) => l.eaName === 'ALL') ||
      null;

    if (!lic) {
      // Fallback: Check if there is a web TradingAccount + User License
      const tradingAccount = await this.prisma.tradingAccount.findFirst({
        where: { accountNumber: String(account) },
        include: {
          user: {
            include: {
              licenses: {
                where: { status: 'ACTIVE' },
                include: { plan: true },
                orderBy: { createdAt: 'desc' }
              }
            }
          }
        }
      });

      if (tradingAccount && tradingAccount.user && tradingAccount.user.licenses.length > 0) {
        // Find a valid unexpired license
        const webLicense = tradingAccount.user.licenses.find(l => {
          if (!l.expiresAt) return true;
          return l.expiresAt > new Date();
        });

        if (webLicense) {
          return {
            valid: true,
            plan: webLicense.plan.name,
            lot: Number(webLicense.lotAllowed),
            expiry: webLicense.expiresAt ? this.formatDate(webLicense.expiresAt) : null,
            message: 'Licence valide.',
          };
        } else {
          return {
            valid: false,
            message: 'Licence expirée. Renouvelez votre abonnement sur le site.',
          };
        }
      }

      return {
        valid: false,
        message: 'Aucune licence trouvée pour ce compte.',
      };
    }

    // Fire-and-forget: update tracking fields
    this.prisma.mt5License
      .update({
        where: { id: lic.id },
        data: {
          lastCheckAt: new Date(),
          lastCheckIp: clientIp,
          checkCount: { increment: 1 },
        },
      })
      .catch((e) =>
        this.logger.error('Erreur mise à jour suivi:', e.message),
      );

    const today = new Date();
    const expiry = new Date(lic.expiryDate);
    const isExpired = expiry < today;

    if (lic.status === 'suspended') {
      return {
        valid: false,
        message: 'Licence suspendue. Contactez le support.',
      };
    }
    if (lic.status === 'cancelled') {
      return { valid: false, message: 'Licence annulée.' };
    }
    if (lic.status === 'expired' || isExpired) {
      return {
        valid: false,
        plan: lic.plan,
        expiry: this.formatDate(lic.expiryDate),
        message: 'Licence expirée. Renouvelez votre abonnement.',
      };
    }

    return {
      valid: true,
      plan: lic.plan,
      lot: Number(lic.lot),
      expiry: this.formatDate(lic.expiryDate),
      message: 'Licence valide.',
    };
  }

  // ----------------------------------------------------------
  //  Admin — Create or renew (upsert on account+EA)
  // ----------------------------------------------------------
  async createOrRenewLicense(dto: CreateMt5LicenseDto) {
    const accountNumber = BigInt(dto.account_number);
    const eaName = dto.ea_name || 'ALL';

    const license = await this.prisma.mt5License.upsert({
      where: {
        accountNumber_eaName: { accountNumber, eaName },
      },
      create: {
        clientName: dto.client_name,
        clientEmail: dto.client_email,
        clientWhatsapp: dto.client_whatsapp || null,
        accountNumber,
        broker: dto.broker || '',
        server: dto.server || '',
        eaName,
        plan: dto.plan,
        lot: dto.lot,
        status: 'active',
        expiryDate: new Date(dto.expiry_date),
      },
      update: {
        clientName: dto.client_name,
        clientEmail: dto.client_email,
        clientWhatsapp: dto.client_whatsapp || null,
        broker: dto.broker || '',
        server: dto.server || '',
        plan: dto.plan,
        lot: dto.lot,
        status: 'active',
        expiryDate: new Date(dto.expiry_date),
      },
    });

    return { success: true, license: this.serializeLicense(license) };
  }

  // ----------------------------------------------------------
  //  Admin — Suspend
  // ----------------------------------------------------------
  async suspendLicense(accountNumber: number, eaName?: string) {
    const ea = eaName || 'ALL';
    try {
      await this.prisma.mt5License.update({
        where: {
          accountNumber_eaName: {
            accountNumber: BigInt(accountNumber),
            eaName: ea,
          },
        },
        data: { status: 'suspended' },
      });
      return { success: true };
    } catch {
      return { success: false };
    }
  }

  // ----------------------------------------------------------
  //  Admin — Reactivate
  // ----------------------------------------------------------
  async reactivateLicense(accountNumber: number, eaName?: string) {
    const ea = eaName || 'ALL';
    try {
      await this.prisma.mt5License.update({
        where: {
          accountNumber_eaName: {
            accountNumber: BigInt(accountNumber),
            eaName: ea,
          },
        },
        data: { status: 'active' },
      });
      return { success: true };
    } catch {
      return { success: false };
    }
  }

  // ----------------------------------------------------------
  //  Admin — List (paginated, with optional search)
  // ----------------------------------------------------------
  async listLicenses(limit: number, offset: number, search?: string) {
    const safeLimit = Math.min(limit || 50, 200);
    const safeOffset = offset || 0;

    const where = search
      ? {
          OR: [
            { clientEmail: { contains: search, mode: 'insensitive' as const } },
            // accountNumber is BigInt — try numeric search if it looks like a number
            ...(isFinite(Number(search))
              ? [{ accountNumber: BigInt(search) }]
              : []),
          ],
        }
      : undefined;

    const [licenses, total] = await Promise.all([
      this.prisma.mt5License.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: safeLimit,
        skip: safeOffset,
      }),
      this.prisma.mt5License.count({ where }),
    ]);

    return {
      licenses: licenses.map((l) => this.serializeLicense(l)),
      total,
      limit: safeLimit,
      offset: safeOffset,
    };
  }

  // ----------------------------------------------------------
  //  Helpers
  // ----------------------------------------------------------

  /** Serialize BigInt and Decimal fields to JSON-safe types */
  private serializeLicense(license: any) {
    return {
      ...license,
      accountNumber: Number(license.accountNumber),
      lot: Number(license.lot),
    };
  }

  private formatDate(d: Date): string {
    const date = new Date(d);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  // ----------------------------------------------------------
  //  History Tracking
  // ----------------------------------------------------------

  async syncHistory(dto: SyncHistoryDto) {
    const accountBigInt = BigInt(dto.account);
    const eaName = dto.ea || 'ALL';

    // 1. Upsert Account Stats
    await this.prisma.mt5AccountStat.upsert({
      where: {
        accountNumber_eaName: {
          accountNumber: accountBigInt,
          eaName: eaName,
        },
      },
      update: {
        balance: dto.balance,
        equity: dto.equity,
        margin: dto.margin,
        freeMargin: dto.freeMargin,
      },
      create: {
        accountNumber: accountBigInt,
        eaName: eaName,
        balance: dto.balance,
        equity: dto.equity,
        margin: dto.margin,
        freeMargin: dto.freeMargin,
      },
    });

    // 2. Upsert Trades if any
    if (dto.trades && dto.trades.length > 0) {
      // Using a transaction to insert/update all trades efficiently
      await this.prisma.$transaction(
        dto.trades.map((trade) =>
          this.prisma.mt5Trade.upsert({
            where: { ticket: BigInt(trade.ticket) },
            update: {
              symbol: trade.symbol,
              type: trade.type,
              volume: trade.volume,
              openPrice: trade.openPrice,
              closePrice: trade.closePrice,
              openTime: new Date(trade.openTime),
              closeTime: new Date(trade.closeTime),
              profit: trade.profit,
              commission: trade.commission,
              swap: trade.swap,
            },
            create: {
              ticket: BigInt(trade.ticket),
              accountNumber: accountBigInt,
              eaName: eaName,
              symbol: trade.symbol,
              type: trade.type,
              volume: trade.volume,
              openPrice: trade.openPrice,
              closePrice: trade.closePrice,
              openTime: new Date(trade.openTime),
              closeTime: new Date(trade.closeTime),
              profit: trade.profit,
              commission: trade.commission,
              swap: trade.swap,
            },
          }),
        ),
      );
    }

    return { success: true, message: 'History synchronized' };
  }

  async getAccountHistory(accountNumber: number) {
    const accountBigInt = BigInt(accountNumber);

    const stats = await this.prisma.mt5AccountStat.findMany({
      where: { accountNumber: accountBigInt },
    });

    const trades = await this.prisma.mt5Trade.findMany({
      where: { accountNumber: accountBigInt },
      orderBy: { closeTime: 'desc' },
      take: 100, // Limit to last 100 trades for performance
    });

    return {
      stats: stats.map((s) => ({
        ...s,
        accountNumber: Number(s.accountNumber),
        balance: Number(s.balance),
        equity: Number(s.equity),
        margin: Number(s.margin),
        freeMargin: Number(s.freeMargin),
      })),
      trades: trades.map((t) => ({
        ...t,
        ticket: Number(t.ticket),
        accountNumber: Number(t.accountNumber),
        volume: Number(t.volume),
        openPrice: Number(t.openPrice),
        closePrice: Number(t.closePrice),
        profit: Number(t.profit),
        commission: Number(t.commission),
        swap: Number(t.swap),
      })),
    };
  }
}
