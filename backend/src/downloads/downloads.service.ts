import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class DownloadsService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async getProducts() {
    return this.prisma.product.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
      },
    });
  }

  async generateSignedUrl(userId: string, productSlug: string, role?: string) {
    // Admins can download without a license
    if (role !== 'ADMIN') {
      const license = await this.prisma.license.findFirst({
        where: {
          userId,
          product: { slug: productSlug },
          status: 'ACTIVE',
          OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
        },
      });

      if (!license) {
        throw new UnauthorizedException(
          'No active license found for this product.',
        );
      }
    }

    // Generate a 15-minute JWT with unique jti (token string itself)
    const rawToken = require('crypto').randomBytes(32).toString('hex');
    const token = this.jwtService.sign(
      { sub: userId, product: productSlug, type: 'download', jti: rawToken },
      { expiresIn: '15m' },
    );

    // Store token in DB
    await this.prisma.downloadToken.create({
      data: {
        token: rawToken,
        userId: userId,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000),
      },
    });

    return {
      url: `/downloads/file?token=${token}`,
    };
  }

  async getFile(token: string) {
    try {
      const payload = this.jwtService.verify(token);
      if (payload.type !== 'download' || !payload.jti) {
        throw new UnauthorizedException('Invalid token type');
      }

      // Check if token exists and is not used
      const dbToken = await this.prisma.downloadToken.findUnique({
        where: { token: payload.jti },
      });

      if (!dbToken || dbToken.used || dbToken.expiresAt < new Date()) {
        throw new UnauthorizedException(
          'This download link has expired or has already been used.',
        );
      }

      // Mark as used
      await this.prisma.downloadToken.update({
        where: { token: payload.jti },
        data: { used: true },
      });

      let filename = `${payload.product}.ex5`;
      let filePath = path.join(process.cwd(), 'files', filename);

      if (!fs.existsSync(filePath)) {
        const filesDir = path.join(process.cwd(), 'files');
        if (fs.existsSync(filesDir)) {
          const files = fs
            .readdirSync(filesDir)
            .filter((f) => f.endsWith('.ex5'));
          // Match the product's own file, ignoring case, spaces and "_"
          // (GOLD_SCALPER -> GoldScalper.ex5). Never fall back to another
          // product's file: no match means 404.
          const normalize = (s: string) =>
            s.toLowerCase().replace(/\.ex5$/, '').replace(/[^a-z0-9]/g, '');
          const wanted = normalize(payload.product);
          const matched = files.find(
            (f) =>
              normalize(f) === wanted ||
              normalize(f) === wanted.replace(/ea$/, ''),
          );

          if (matched) {
            filePath = path.join(filesDir, matched);
          }
        }
      }

      if (!fs.existsSync(filePath)) {
        throw new NotFoundException('EA file not found on server');
      }

      return {
        filename: path.basename(filePath),
        path: filePath,
      };
    } catch (e) {
      if (e instanceof NotFoundException) throw e;
      throw new UnauthorizedException('Invalid or expired download token');
    }
  }
}
