import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getEAs() {
    const filesDir = path.join(process.cwd(), 'files');
    if (!fs.existsSync(filesDir)) return [{ value: 'ALL', label: 'ALL (tous les EA)' }];
    
    const files = fs.readdirSync(filesDir);
    const eas = files
      .filter(f => f.endsWith('.ex5'))
      .map(f => {
        const eaName = f.replace('.ex5', '');
        return { value: eaName, label: eaName };
      });
      
    // Always add 'ALL' at the end
    eas.push({ value: 'ALL', label: 'ALL (tous les EA)' });
    return eas;
  }

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
    // 1. Seed JMEgold_scalper EA
    const product = await this.prisma.product.upsert({
      where: { slug: 'JMEGOLD_SCALPER EA' },
      update: {
        name: 'JMEgold_scalper EA',
        description: 'Expert Advisor JME Gold Scalper (MT5)'
      },
      create: {
        name: 'JMEgold_scalper EA',
        slug: 'JMEGOLD_SCALPER EA',
        description: 'Expert Advisor JME Gold Scalper (MT5)'
      }
    });

    // Clear existing plans for this product to avoid duplicates during seed
    await this.prisma.productPlan.deleteMany({ where: { productId: product.id } });

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

  async getWithdrawals() {
    return this.prisma.withdrawalRequest.findMany({
      include: {
        affiliate: {
          include: {
            user: { select: { name: true, email: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async updateWithdrawalStatus(id: string, status: string, txHash?: string) {
    return this.prisma.withdrawalRequest.update({
      where: { id },
      data: { status, txHash }
    });
  }
}
