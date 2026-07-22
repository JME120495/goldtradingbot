import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class AppService {
  constructor(private prisma: PrismaService) {}

  getHello(): string {
    return 'Hello World!';
  }

  async getPlans() {
    return this.prisma.productPlan.findMany({
      where: { product: { isActive: true } },
      include: { product: true }
    });
  }
}
