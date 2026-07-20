import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getAffiliates() {
    const affiliates = await this.prisma.affiliate.findMany({
      include: {
        user: { select: { name: true, email: true } },
        sales: true
      }
    });
    
    return affiliates.map(aff => {
      const totalEarned = aff.sales.reduce((sum, sale) => sum + sale.commission, 0);
      const totalSales = aff.sales.length;
      return { ...aff, totalEarned, totalSales };
    });
  }

  async updateAffiliateCommission(id: string, rate: number) {
    return this.prisma.affiliate.update({
      where: { id },
      data: { commissionRate: rate }
    });
  }

  async updateAffiliateStatus(id: string, status: string) {
    return this.prisma.affiliate.update({
      where: { id },
      data: { status }
    });
  }

  async deleteAffiliate(id: string) {
    return this.prisma.affiliate.delete({ where: { id } });
  }

  async createAffiliateManually(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new Error('User not found');
    }
    
    const existing = await this.prisma.affiliate.findUnique({ where: { userId: user.id } });
    if (existing) {
      return existing;
    }

    const randomStr = Math.random().toString(36).substring(2, 8).toLowerCase();
    const code = `${user.name ? user.name.split(' ')[0].toLowerCase() : 'ref'}${randomStr}`;

    return this.prisma.affiliate.create({
      data: {
        userId: user.id,
        code,
        status: 'APPROVED',
      }
    });
  }

  async getLicenses() {
    return this.prisma.license.findMany({
      include: {
        user: { select: { name: true, email: true } },
        plan: { select: { name: true, lotAllowed: true } }
      }
    });
  }

  async updateLicenseStatus(id: string, status: string) {
    return this.prisma.license.update({
      where: { id },
      data: { status }
    });
  }

  async createLicenseManually(email: string, planId: string, durationDays: number) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new Error('User not found');
    }

    const plan = await this.prisma.productPlan.findUnique({ where: { id: planId } });
    if (!plan) {
      throw new Error('Plan not found');
    }

    let expiresAt: Date | null = null;
    if (durationDays > 0) {
      expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + durationDays);
    }

    return this.prisma.license.create({
      data: {
        userId: user.id,
        productId: plan.productId,
        planId: plan.id,
        status: 'ACTIVE',
        lotAllowed: plan.lotAllowed,
        expiresAt
      }
    });
  }

  async getPlans() {
    return this.prisma.productPlan.findMany({
      include: { product: true }
    });
  }

  async seedProducts() {
    const product = await this.prisma.product.create({
      data: {
        name: 'Gold Scalper MT5',
        slug: 'gold-scalper-mt5',
        description: 'Expert Advisor Gold Scalper (MT5)'
      }
    });

    await this.prisma.productPlan.createMany({
      data: [
        {
          productId: product.id,
          name: 'Starter',
          lotAllowed: 0.01,
          prices: '{"monthly": 50, "yearly": 400}'
        },
        {
          productId: product.id,
          name: 'Pro',
          lotAllowed: 0.1,
          prices: '{"monthly": 100, "yearly": 800}'
        }
      ]
    });

    return { success: true, message: 'Products seeded successfully' };
  }
}
