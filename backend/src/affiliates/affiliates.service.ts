import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AffiliatesService {
  constructor(private prisma: PrismaService) {}

  async joinProgram(userId: string) {
    const existing = await this.prisma.affiliate.findUnique({ where: { userId } });
    if (existing) return existing;

    const code = 'REF' + Math.random().toString(36).substring(2, 8).toUpperCase();
    
    return this.prisma.affiliate.create({
      data: {
        userId,
        code,
        status: 'ACTIVE',
      }
    });
  }

  async getStats(userId: string) {
    const affiliate = await this.prisma.affiliate.findUnique({
      where: { userId },
      include: { 
        sales: true,
        withdrawals: {
          orderBy: { createdAt: 'desc' }
        },
        referredUsers: {
          select: {
            name: true,
            email: true,
            createdAt: true,
          }
        }
      }
    });

    if (!affiliate) throw new NotFoundException('Not an affiliate');

    const totalSales = affiliate.sales.length;
    const totalEarned = affiliate.sales.reduce((sum, sale) => sum + sale.commission, 0);
    const totalWithdrawn = affiliate.withdrawals
      .filter(w => w.status === 'COMPLETED' || w.status === 'PENDING')
      .reduce((sum, w) => sum + w.amount, 0);
    const availableBalance = totalEarned - totalWithdrawn;

    return {
      affiliate: {
        code: affiliate.code,
        clicks: affiliate.clicks,
        status: affiliate.status,
        commissionRate: affiliate.commissionRate,
        walletAddress: affiliate.walletAddress,
      },
      totalSales,
      totalEarned,
      salesHistory: affiliate.sales,
      withdrawals: affiliate.withdrawals,
      availableBalance,
      referredUsers: affiliate.referredUsers
    };
  }

  async updateWallet(userId: string, walletAddress: string) {
    const affiliate = await this.prisma.affiliate.findUnique({ where: { userId } });
    if (!affiliate) throw new NotFoundException('Not an affiliate');
    
    return this.prisma.affiliate.update({
      where: { id: affiliate.id },
      data: { walletAddress }
    });
  }

  async requestWithdrawal(userId: string, amount: number) {
    if (amount < 50) {
      throw new BadRequestException('Minimum withdrawal is $50');
    }

    const stats = await this.getStats(userId);
    if (stats.availableBalance < amount) {
      throw new BadRequestException('Insufficient available balance');
    }

    const affiliate = await this.prisma.affiliate.findUnique({ where: { userId } });
    if (!affiliate) throw new NotFoundException('Not an affiliate');

    return this.prisma.withdrawalRequest.create({
      data: {
        affiliateId: affiliate.id,
        amount,
        status: 'PENDING'
      }
    });
  }
}
