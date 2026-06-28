import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TradingAccountsService {
  constructor(private prisma: PrismaService) {}

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

    return this.prisma.tradingAccount.create({
      data: {
        userId,
        accountNumber: data.accountNumber,
        broker: data.broker,
        server: data.server,
      }
    });
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

    return this.prisma.tradingAccount.delete({
      where: { id: accountId }
    });
  }
}
