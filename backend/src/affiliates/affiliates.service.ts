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
        status: 'ACTIVE',
      }
    });
  }

  async getStats(userId: string) {
    const affiliate = await this.prisma.affiliate.findUnique({
      where: { userId },
      include: { 
        sales: true,
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

    return {
      affiliate: {
        code: affiliate.code,
        clicks: affiliate.clicks,
        status: affiliate.status,
        commissionRate: affiliate.commissionRate,
      },
      totalSales,
      totalEarned,
      salesHistory: affiliate.sales,
      referredUsers: affiliate.referredUsers
    };
  }
}
