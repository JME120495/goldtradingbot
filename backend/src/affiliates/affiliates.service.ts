import { Injectable, NotFoundException } from '@nestjs/common';
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
      }
    });
  }

  async getStats(userId: string) {
    const affiliate = await this.prisma.affiliate.findUnique({
      where: { userId },
      include: { sales: true }
    });

    if (!affiliate) throw new NotFoundException('Not an affiliate');

    const totalSales = affiliate.sales.length;
    let tier = 'Bronze';
    let commissionRate = 0.10;

    if (totalSales >= 50) {
      tier = 'Gold';
      commissionRate = 0.30;
    } else if (totalSales >= 10) {
      tier = 'Silver';
      commissionRate = 0.20;
    }

    const totalEarned = affiliate.sales.reduce((sum, sale) => sum + sale.commission, 0);

    return {
      code: affiliate.code,
      clicks: affiliate.clicks,
      totalSales,
      tier,
      commissionRate,
      totalEarned,
      status: affiliate.status,
      salesHistory: affiliate.sales
    };
  }
}
