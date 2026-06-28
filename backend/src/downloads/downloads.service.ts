import { Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class DownloadsService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService
  ) {}

  async generateSignedUrl(userId: string, productSlug: string) {
    const license = await this.prisma.license.findFirst({
      where: {
        userId,
        product: { slug: productSlug },
        status: 'ACTIVE',
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } }
        ]
      }
    });

    if (!license) {
      throw new UnauthorizedException('No active license found for this product.');
    }

    // Generate a 15-minute token
    const token = this.jwtService.sign(
      { sub: userId, product: productSlug, type: 'download' },
      { expiresIn: '15m' }
    );

    return {
      url: `/downloads/file?token=${token}`
    };
  }

  async getFile(token: string) {
    try {
      const payload = this.jwtService.verify(token);
      if (payload.type !== 'download') {
        throw new UnauthorizedException('Invalid token type');
      }

      const filename = `${payload.product}.ex5`;
      const filePath = path.join(process.cwd(), 'files', filename);

      if (!fs.existsSync(filePath)) {
        throw new NotFoundException('EA file not found on server');
      }

      return { 
        filename,
        path: filePath
      };
    } catch (e) {
      if (e instanceof NotFoundException) throw e;
      throw new UnauthorizedException('Invalid or expired download token');
    }
  }
}
