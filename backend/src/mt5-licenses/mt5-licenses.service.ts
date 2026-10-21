import {
  BadRequestException,
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMt5LicenseDto } from './dto/create-mt5-license.dto';
import { SyncHistoryDto } from './dto/sync-history.dto';

const ACCOUNT_CHANGE_DAYS = 30;
const DAY_MS = 24 * 60 * 60 * 1000;

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
        tradingAccounts: {
          orderBy: { createdAt: 'asc' }, // Oldest accounts get priority
        },
        licenses: {
          where: { status: 'ACTIVE' },
          include: { plan: true, product: true },
          orderBy: { createdAt: 'desc' }, // Newest/best licenses first
        },
      },
    });

    if (!user) return;

    // Filter to truly active licenses
    const activeLicenses = user.licenses.filter(l => !l.expiresAt || l.expiresAt > new Date());

    // 1 licence = 1 compte: a license already bound to an account is never moved.
    // Only unbound licenses are auto-linked to accounts that hold no active license.
    const boundAccountIds = new Set(activeLicenses.map(l => l.tradingAccountId));
    const freeAccounts = user.tradingAccounts.filter(a => !boundAccountIds.has(a.id));

    for (const webLicense of activeLicenses.filter(l => !l.tradingAccountId)) {
      const account = freeAccounts.shift();
      if (!account) break;

      await this.prisma.$transaction([
        this.prisma.license.update({
          where: { id: webLicense.id },
          data: { tradingAccountId: account.id },
        }),
        this.prisma.licenseAccountHistory.create({
          data: {
            licenseId: webLicense.id,
            oldAccount: null,
            newAccount: BigInt(account.accountNumber),
            changedBy: 'client',
          },
        }),
      ]);
      webLicense.tradingAccountId = account.id;
    }

    for (const account of user.tradingAccounts) {
      const accountNumber = BigInt(account.accountNumber);
      const accountLicenses = activeLicenses.filter(l => l.tradingAccountId === account.id);

      if (accountLicenses.length === 0) {
        // No active license on this account. Suspend its MT5 licenses.
        try {
           await this.prisma.mt5License.updateMany({
             where: { accountNumber },
             data: { status: 'suspended' }
           });
        } catch(e) {}
        continue;
      }

      for (const webLicense of accountLicenses) {
        const eaName = webLicense.product.slug;

        // Upsert an Mt5License to keep the robot working
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

  // ----------------------------------------------------------
  //  1 licence = 1 compte MT5
  // ----------------------------------------------------------

  /** Client (JWT): bind or change the MT5 account of one of their licenses. */
  async registerAccount(userId: string, licenseId: string, rawAccount: unknown) {
    const accountNumber = this.parseAccountNumber(rawAccount);
    const license = await this.prisma.license.findUnique({
      where: { id: String(licenseId || '') },
      include: { tradingAccount: true },
    });
    if (!license || license.userId !== userId) {
      throw new NotFoundException('Licence introuvable.');
    }

    // First binding is free; afterwards one change per ACCOUNT_CHANGE_DAYS
    if (license.tradingAccountId && license.accountChangedAt) {
      const nextChangeAt = new Date(
        license.accountChangedAt.getTime() + ACCOUNT_CHANGE_DAYS * DAY_MS,
      );
      if (nextChangeAt > new Date()) {
        throw new HttpException(
          {
            statusCode: HttpStatus.TOO_MANY_REQUESTS,
            message: `Un seul changement de compte par ${ACCOUNT_CHANGE_DAYS} jours. Prochain changement possible le ${nextChangeAt.toLocaleDateString('fr-FR')}.`,
            next_change_at: nextChangeAt.toISOString(),
          },
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }
    }

    return this.bindAccount(license, accountNumber, 'client');
  }

  /** Admin: change the MT5 account without the 30-day limit (client timer untouched). */
  async adminChangeAccount(licenseId: string, rawAccount: unknown) {
    const accountNumber = this.parseAccountNumber(rawAccount);
    const license = await this.prisma.license.findUnique({
      where: { id: String(licenseId || '') },
      include: { tradingAccount: true },
    });
    if (!license) {
      throw new NotFoundException('Licence introuvable.');
    }
    return this.bindAccount(license, accountNumber, 'admin');
  }

  async getLicenseAccountHistory(licenseId: string) {
    const history = await this.prisma.licenseAccountHistory.findMany({
      where: { licenseId },
      orderBy: { changedAt: 'desc' },
    });
    return history.map((h) => ({
      ...h,
      oldAccount: h.oldAccount === null ? null : Number(h.oldAccount),
      newAccount: Number(h.newAccount),
    }));
  }

  private async bindAccount(
    license: Prisma.LicenseGetPayload<{ include: { tradingAccount: true } }>,
    accountNumber: bigint,
    changedBy: 'client' | 'admin',
  ) {
    const newAccount = accountNumber.toString();
    const oldAccount = license.tradingAccount?.accountNumber ?? null;
    if (oldAccount === newAccount) {
      throw new BadRequestException('Cette licence est déjà liée à ce compte MT5.');
    }

    const product = await this.prisma.product.findUnique({
      where: { id: license.productId },
    });
    const owner = await this.prisma.user.findUnique({
      where: { id: license.userId },
    });
    const eaName = product?.slug || 'ALL';

    // The account must not belong to another client, nor carry another
    // license for the same EA (web license or manual mt5_licenses row).
    const conflict =
      (await this.prisma.tradingAccount.findFirst({
        where: { accountNumber: newAccount, userId: { not: license.userId } },
      })) ||
      (await this.prisma.license.findFirst({
        where: {
          id: { not: license.id },
          productId: license.productId,
          status: 'ACTIVE',
          tradingAccount: { accountNumber: newAccount },
          OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
        },
      })) ||
      (await this.prisma.mt5License.findFirst({
        where: {
          accountNumber,
          eaName,
          status: 'active',
          clientEmail: { not: owner?.email },
        },
      }));
    if (conflict) {
      throw new ConflictException('Ce compte MT5 est déjà lié à une autre licence');
    }

    const tradingAccount =
      (await this.prisma.tradingAccount.findFirst({
        where: { userId: license.userId, accountNumber: newAccount },
      })) ||
      (await this.prisma.tradingAccount.create({
        data: { userId: license.userId, accountNumber: newAccount, broker: '' },
      }));

    const isChange = oldAccount !== null;
    await this.prisma.$transaction([
      this.prisma.license.update({
        where: { id: license.id },
        data: {
          tradingAccountId: tradingAccount.id,
          ...(isChange && { accountChangeCount: { increment: 1 } }),
          // Admin changes do not reset the client's 30-day timer
          ...(isChange && changedBy === 'client' && { accountChangedAt: new Date() }),
        },
      }),
      this.prisma.licenseAccountHistory.create({
        data: {
          licenseId: license.id,
          oldAccount: oldAccount === null ? null : BigInt(oldAccount),
          newAccount: accountNumber,
          changedBy,
        },
      }),
    ]);

    // The old account loses this EA unless another active license of the same product stays on it
    if (isChange && license.tradingAccountId) {
      const stillCovered = await this.prisma.license.findFirst({
        where: {
          tradingAccountId: license.tradingAccountId,
          productId: license.productId,
          status: 'ACTIVE',
          OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
        },
      });
      if (!stillCovered) {
        await this.prisma.mt5License.updateMany({
          where: { accountNumber: BigInt(oldAccount!), eaName },
          data: { status: 'suspended' },
        });
      }
    }

    await this.syncUserToMt5Licenses(license.userId);

    const updated = await this.prisma.license.findUnique({
      where: { id: license.id },
      include: { tradingAccount: true },
    });
    return {
      success: true,
      license_id: license.id,
      account_number: Number(accountNumber),
      account_change_count: updated?.accountChangeCount ?? 0,
      account_changed_at: updated?.accountChangedAt ?? null,
      next_change_at: updated?.accountChangedAt
        ? new Date(updated.accountChangedAt.getTime() + ACCOUNT_CHANGE_DAYS * DAY_MS)
        : null,
    };
  }

  /** Strictly a positive integer (number or digit string), nothing else. */
  private parseAccountNumber(raw: unknown): bigint {
    const str =
      typeof raw === 'number' && Number.isSafeInteger(raw)
        ? String(raw)
        : typeof raw === 'string'
          ? raw.trim()
          : '';
    if (!/^[1-9]\d{0,17}$/.test(str)) {
      throw new BadRequestException(
        'Numéro de compte MT5 invalide : entier positif uniquement.',
      );
    }
    return BigInt(str);
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
    // Fetch all licenses for this account number
    const licenses = await this.prisma.mt5License.findMany({
      where: {
        accountNumber: BigInt(account),
      },
      orderBy: { eaName: 'desc' },
    });

    // Pick the best match: prefer exact/partial EA name over 'ALL'
    const searchEa = eaName.toLowerCase().replace(/[^a-z0-9]/g, '');

    const lic =
      licenses.find((l) => l.eaName === eaName) ||
      licenses.find((l) => {
        const dbEa = l.eaName.toLowerCase().replace(/[^a-z0-9]/g, '');
        return (
          dbEa === searchEa ||
          searchEa.includes(dbEa) ||
          dbEa.includes(searchEa)
        );
      }) ||
      licenses.find((l) => l.eaName === 'ALL') ||
      null;

    if (!lic) {
      // Fallback: Check if there is a web TradingAccount + User License
      const tradingAccount = await this.prisma.tradingAccount.findFirst({
        where: { accountNumber: String(account) },
        include: {
          licenses: {
            where: { status: 'ACTIVE' },
            include: { plan: true },
            orderBy: { createdAt: 'desc' },
          },
        },
      });

      if (
        tradingAccount &&
        tradingAccount.licenses.length > 0
      ) {
        // Find a valid unexpired license explicitly linked to this account
        const webLicense = tradingAccount.licenses.find((l) => {
          if (!l.expiresAt) return true;
          return l.expiresAt > new Date();
        });

        if (webLicense) {
          const payload = {
            active: true,
            plan: webLicense.plan.name,
            lot: Number(webLicense.lotAllowed),
            expiresAt: webLicense.expiresAt
              ? this.formatDate(webLicense.expiresAt)
              : null,
          };
          return {
            valid: true,
            plan: webLicense.plan.name,
            lot: Number(webLicense.lotAllowed),
            expiry: webLicense.expiresAt
              ? this.formatDate(webLicense.expiresAt)
              : null,
            message: 'Licence valide.',
            ...this.signPayload(payload),
          };
        } else {
          return {
            valid: false,
            message:
              'Licence expirée. Renouvelez votre abonnement sur le site.',
            ...this.signPayload({ active: false }),
          };
        }
      }

      return {
        valid: false,
        message: 'Aucune licence trouvée pour ce compte.',
        ...this.signPayload({ active: false }),
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
      .catch((e) => this.logger.error('Erreur mise à jour suivi:', e.message));

    const today = new Date();
    const expiry = new Date(lic.expiryDate);
    const isExpired = expiry < today;

    if (lic.status === 'suspended') {
      return {
        valid: false,
        message: 'Licence suspendue. Contactez le support.',
        ...this.signPayload({ active: false }),
      };
    }
    if (lic.status === 'cancelled') {
      return {
        valid: false,
        message: 'Licence annulée.',
        ...this.signPayload({ active: false }),
      };
    }
    if (lic.status === 'expired' || isExpired) {
      return {
        valid: false,
        plan: lic.plan,
        expiry: this.formatDate(lic.expiryDate),
        message: 'Licence expirée. Renouvelez votre abonnement.',
        ...this.signPayload({ active: false }),
      };
    }

    const payload = {
      active: true,
      plan: lic.plan,
      lot: Number(lic.lot),
      expiresAt: this.formatDate(lic.expiryDate),
    };

    return {
      valid: true,
      plan: lic.plan,
      lot: Number(lic.lot),
      expiry: this.formatDate(lic.expiryDate),
      message: 'Licence valide.',
      ...this.signPayload(payload),
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
  //  Admin — Delete
  // ----------------------------------------------------------
  async deleteLicense(id: number) {
    try {
      await this.prisma.mt5License.delete({
        where: { id },
      });
      return { success: true };
    } catch {
      return { success: false };
    }
  }

  // ----------------------------------------------------------
  //  Admin — Bulk Actions
  // ----------------------------------------------------------
  async bulkActionMt5Licenses(
    ids: number[],
    action: 'delete' | 'suspend' | 'reactivate',
  ) {
    try {
      if (action === 'delete') {
        await this.prisma.mt5License.deleteMany({
          where: { id: { in: ids } },
        });
      } else if (action === 'suspend') {
        await this.prisma.mt5License.updateMany({
          where: { id: { in: ids } },
          data: { status: 'suspended' },
        });
      } else if (action === 'reactivate') {
        await this.prisma.mt5License.updateMany({
          where: { id: { in: ids } },
          data: { status: 'active' },
        });
      }
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

  private signPayload(payload: any) {
    const secret = process.env.EA_SECRET || '';
    const jsonString = JSON.stringify(payload);
    const signature = crypto
      .createHmac('sha256', secret)
      .update(jsonString)
      .digest('hex');
    return {
      payload,
      signature,
    };
  }

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
