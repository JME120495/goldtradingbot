import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMt5LicenseDto } from './dto/create-mt5-license.dto';

@Injectable()
export class Mt5LicensesService {
  private readonly logger = new Logger(Mt5LicensesService.name);

  constructor(private prisma: PrismaService) {}

  // ----------------------------------------------------------
  //  Verify — called by the EA (public endpoint)
  //  Returns ONLY non-sensitive data: valid, plan, lot, expiry, message
  // ----------------------------------------------------------
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
}
