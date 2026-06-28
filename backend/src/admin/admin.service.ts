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
}
