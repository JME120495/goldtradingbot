import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Mt5LicensesService } from '../mt5-licenses/mt5-licenses.service';

@Injectable()
export class TradingAccountsService {
  constructor(
    private prisma: PrismaService,
    private mt5LicensesService: Mt5LicensesService
  ) {}

  async findAll(userId: string) {
    return this.prisma.tradingAccount.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
  }

  async create(userId: string, data: { accountNumber: string, broker: string, server?: string }) {
    // Check if account already exists
    const existing = await this.prisma.tradingAccount.findUnique({
      where: {
        accountNumber_broker: {
          accountNumber: data.accountNumber,
          broker: data.broker
        }
      }
    });

    if (existing) {
      if (existing.userId === userId) {
        throw new ConflictException('You have already linked this account.');
      } else {
        throw new ConflictException('This account is already linked by another user.');
      }
    }

    const newAccount = await this.prisma.tradingAccount.create({
      data: {
        userId,
        accountNumber: data.accountNumber,
        broker: data.broker,
        server: data.server,
      }
    });

    // Synchronize to MT5 standalone table
    await this.mt5LicensesService.syncUserToMt5Licenses(userId);

    return newAccount;
  }

  async delete(userId: string, accountId: string) {
    const account = await this.prisma.tradingAccount.findFirst({
      where: { id: accountId, userId }
    });

    if (!account) {
      throw new NotFoundException('Account not found');
    }

    // Detach licenses (set tradingAccountId to null)
    await this.prisma.license.updateMany({
      where: { tradingAccountId: accountId },
      data: { tradingAccountId: null }
    });

    const deleted = await this.prisma.tradingAccount.delete({
      where: { id: accountId }
    });

    // We leave the old MT5 licenses for now or we could suspend them. 
    // Usually they are detached or can just be left since the web account is unlinked.

    return deleted;
  }
}
