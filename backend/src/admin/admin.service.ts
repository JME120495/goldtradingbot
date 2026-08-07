import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getUsers() {
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        isBanned: true,
        licenses: { select: { id: true } },
        tradingAccounts: { select: { id: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return users.map((user) => ({
      ...user,
      licensesCount: user.licenses.length,
      tradingAccountsCount: user.tradingAccounts.length,
      // Remove the raw arrays to keep response clean
      licenses: undefined,
      tradingAccounts: undefined,
    }));
  }

  async toggleBanUser(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('User not found');

    // Un admin ne peut pas se bannir lui-même ou bannir un autre admin
    if (user.role === 'ADMIN') {
      throw new Error('Cannot ban an administrator');
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: { isBanned: !user.isBanned },
      select: { id: true, isBanned: true },
    });
  }

  async getEAs() {
    const filesDir = path.join(process.cwd(), 'files');
    if (!fs.existsSync(filesDir))
      return [{ value: 'ALL', label: 'ALL (tous les EA)' }];

    const files = fs.readdirSync(filesDir);
    const eas = files
      .filter((f) => f.endsWith('.ex5'))
      .map((f) => {
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
        sales: true,
      },
    });

    return affiliates.map((aff) => {
      const totalEarned = aff.sales.reduce(
        (sum, sale) => sum + sale.commission,
        0,
      );
      const totalSales = aff.sales.length;
      return { ...aff, totalEarned, totalSales };
    });
  }

  async updateAffiliateCommission(id: string, rate: number) {
    return this.prisma.affiliate.update({
      where: { id },
      data: { commissionRate: rate },
    });
  }

  async updateAffiliateStatus(id: string, status: string) {
    return this.prisma.affiliate.update({
      where: { id },
      data: { status },
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

    const existing = await this.prisma.affiliate.findUnique({
      where: { userId: user.id },
    });
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
      },
    });
  }

  async getLicenses() {
    return this.prisma.license.findMany({
      include: {
        user: { select: { name: true, email: true } },
        plan: { select: { name: true, lotAllowed: true } },
      },
    });
  }

  async updateLicenseStatus(id: string, status: string) {
    return this.prisma.license.update({
      where: { id },
      data: { status },
    });
  }

  async deleteLicense(id: string) {
    // Nullify payment relations first to avoid foreign key constraints
    await this.prisma.payment.updateMany({
      where: { licenseId: id },
      data: { licenseId: null },
    });
    return this.prisma.license.delete({
      where: { id },
    });
  }

  async bulkActionLicenses(
    ids: string[],
    action: 'delete' | 'activate' | 'cancel',
  ) {
    if (action === 'delete') {
      await this.prisma.payment.updateMany({
        where: { licenseId: { in: ids } },
        data: { licenseId: null },
      });
      return this.prisma.license.deleteMany({
        where: { id: { in: ids } },
      });
    } else if (action === 'activate') {
      return this.prisma.license.updateMany({
        where: { id: { in: ids } },
        data: { status: 'ACTIVE' },
      });
    } else if (action === 'cancel') {
      return this.prisma.license.updateMany({
        where: { id: { in: ids } },
        data: { status: 'CANCELLED' },
      });
    }
    throw new Error('Invalid action');
  }

  async createLicenseManually(
    email: string,
    planId: string,
    durationDays: number,
  ) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new Error('User not found');
    }

    const plan = await this.prisma.productPlan.findUnique({
      where: { id: planId },
    });
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
        expiresAt,
      },
    });
  }

  async getPlans() {
    return this.prisma.productPlan.findMany({
      include: { product: true },
    });
  }

  async seedProducts() {
    // 1. Seed GOLD_SCALPER
    const product = await this.prisma.product.upsert({
      where: { slug: 'GOLD_SCALPER' },
      update: {
        name: 'GOLD_SCALPER',
        description: 'Expert Advisor Gold Scalper (MT5)',
      },
      create: {
        name: 'GOLD_SCALPER',
        slug: 'GOLD_SCALPER',
        description: 'Expert Advisor Gold Scalper (MT5)',
      },
    });

    // Clear existing plans for this product to avoid duplicates during seed
    await this.prisma.productPlan.deleteMany({
      where: { productId: product.id },
    });

    await this.prisma.productPlan.createMany({
      data: [
        {
          productId: product.id,
          name: 'Starter',
          lotAllowed: 0.01,
          prices: '{"monthly": 50, "yearly": 400}',
        },
        {
          productId: product.id,
          name: 'Pro',
          lotAllowed: 0.1,
          prices: '{"monthly": 100, "yearly": 800}',
        },
      ],
    });

    return { success: true, message: 'Products seeded successfully' };
  }

  async getWithdrawals() {
    return this.prisma.withdrawalRequest.findMany({
      include: {
        affiliate: {
          include: {
            user: { select: { name: true, email: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateWithdrawalStatus(id: string, status: string, txHash?: string) {
    return this.prisma.withdrawalRequest.update({
      where: { id },
      data: { status, txHash },
    });
  }

  async getAnalytics() {
    const totalUsers = await this.prisma.user.count();
    const activeLicenses = await this.prisma.license.count({
      where: { status: 'ACTIVE' },
    });
    const totalSales = await this.prisma.payment.count({
      where: { status: 'COMPLETED' },
    });
    const revenueResult = await this.prisma.payment.aggregate({
      _sum: { amount: true },
      where: { status: 'COMPLETED' },
    });

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const payments = await this.prisma.payment.findMany({
      where: { status: 'COMPLETED', createdAt: { gte: sixMonthsAgo } },
      select: { amount: true, createdAt: true },
    });

    const monthlyRevenue: Record<string, number> = {};
    payments.forEach((p) => {
      const month = p.createdAt.toLocaleString('fr-FR', {
        month: 'short',
        year: 'numeric',
      });
      monthlyRevenue[month] = (monthlyRevenue[month] || 0) + p.amount;
    });

    const revenueData = Object.keys(monthlyRevenue).map((key) => ({
      name: key,
      revenue: monthlyRevenue[key],
    }));

    // --- NEW: MT5 Analytics ---
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const mt5EquityAgg = await this.prisma.mt5AccountStat.aggregate({
      _sum: { equity: true },
    });
    const totalMt5Equity = Number(mt5EquityAgg._sum.equity || 0);

    const activeMt5Accounts24h = await this.prisma.mt5License.count({
      where: { lastCheckAt: { gte: yesterday } },
    });

    const recentMt5Trades = await this.prisma.mt5TradeHistory.findMany({
      where: { openTime: { gte: sevenDaysAgo } },
      select: { openTime: true, profit: true },
    });

    const tradesByDay: Record<string, number> = {};
    recentMt5Trades.forEach((t) => {
      const day = t.openTime.toLocaleDateString('fr-FR', { weekday: 'short' });
      tradesByDay[day] = (tradesByDay[day] || 0) + Number(t.profit);
    });

    const mt5ProfitData = Object.keys(tradesByDay).map((day) => ({
      name: day,
      profit: tradesByDay[day],
    }));

    return {
      totalUsers,
      activeLicenses,
      totalSales,
      totalRevenue: revenueResult._sum.amount || 0,
      revenueData,
      totalMt5Equity,
      activeMt5Accounts24h,
      mt5ProfitData,
    };
  }
}
