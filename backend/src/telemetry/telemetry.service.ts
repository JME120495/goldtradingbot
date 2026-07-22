import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TelemetryService {
  constructor(private prisma: PrismaService) {}

  async processSnapshot(data: any) {
    if (!data.account) {
      throw new Error('Compte manquant.');
    }

    // Enregistrer le snapshot
    await this.prisma.mt5AccountSnapshot.create({
      data: {
        accountNumber: BigInt(data.account),
        eaName: data.ea || 'ALL',
        balance: data.balance || 0,
        equity: data.equity || 0,
        margin: data.margin || 0,
        freeMargin: data.freeMargin || 0,
      },
    });

    return { status: 'success', message: 'Snapshot enregistré.' };
  }

  async processDeal(data: any) {
    if (!data.ticket || !data.account) {
      throw new Error('Données du trade incomplètes (ticket et account requis).');
    }

    // Enregistrer l'historique du trade
    await this.prisma.mt5TradeHistory.upsert({
      where: {
        ticket_accountNumber: {
          ticket: BigInt(data.ticket),
          accountNumber: BigInt(data.account),
        },
      },
      update: {
        eaName: data.ea || 'ALL',
        symbol: data.symbol || '',
        type: data.type || '',
        volume: data.volume || 0,
        openPrice: data.openPrice || 0,
        closePrice: data.closePrice || 0,
        openTime: data.openTime ? new Date(data.openTime) : new Date(),
        closeTime: data.closeTime ? new Date(data.closeTime) : new Date(),
        profit: data.profit || 0,
        commission: data.commission || 0,
        swap: data.swap || 0,
        stopLoss: data.stopLoss || null,
        takeProfit: data.takeProfit || null,
      },
      create: {
        ticket: BigInt(data.ticket),
        accountNumber: BigInt(data.account),
        eaName: data.ea || 'ALL',
        symbol: data.symbol || '',
        type: data.type || '',
        volume: data.volume || 0,
        openPrice: data.openPrice || 0,
        closePrice: data.closePrice || 0,
        openTime: data.openTime ? new Date(data.openTime) : new Date(),
        closeTime: data.closeTime ? new Date(data.closeTime) : new Date(),
        profit: data.profit || 0,
        commission: data.commission || 0,
        swap: data.swap || 0,
        stopLoss: data.stopLoss || null,
        takeProfit: data.takeProfit || null,
      },
    });

    return { status: 'success', message: 'Trade enregistré.' };
  }

  async getAdminStats(account: number) {
    const snapshots = await this.prisma.mt5AccountSnapshot.findMany({
      where: { accountNumber: BigInt(account) },
      orderBy: { recordedAt: 'desc' },
      take: 50,
    });

    const trades = await this.prisma.mt5TradeHistory.findMany({
      where: { accountNumber: BigInt(account) },
      orderBy: { closeTime: 'desc' },
      take: 100,
    });

    // Conversion des BigInt pour la réponse JSON
    const formatBigInt = (obj: any) => {
      return JSON.parse(
        JSON.stringify(obj, (key, value) =>
          typeof value === 'bigint' ? value.toString() : value,
        ),
      );
    };

    return {
      account,
      snapshots: formatBigInt(snapshots),
      trades: formatBigInt(trades),
    };
  }
}
