import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { TwoFactorAuthService } from './twoFactorAuth.service';

import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private twoFactorAuthService: TwoFactorAuthService,
  ) {}

  async register(data: RegisterDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existingUser) {
      throw new ConflictException('Email already in use');
    }

    if (data.phone) {
      const existingPhone = await this.prisma.user.findUnique({
        where: { phone: data.phone },
      });
      if (existingPhone) {
        throw new ConflictException('Phone number already in use');
      }
    }

    const hashedPassword = await argon2.hash(data.password, {
      type: argon2.argon2id,
      memoryCost: 65536,
      timeCost: 3,
      parallelism: 4,
    });
    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        passwordHash: hashedPassword,
        phone: data.phone,
        preferredCurrency: data.preferredCurrency || 'USD',
      },
    });

    if (data.refcode) {
      const affiliate = await this.prisma.affiliate.findUnique({
        where: { code: data.refcode },
      });
      if (affiliate) {
        await this.prisma.user.update({
          where: { id: user.id },
          data: { referredById: affiliate.id },
        });
      }
    }

    return this.generateTokens(user.id, user.role);
  }

  async login(data: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: data.email },
    });
    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const isPasswordValid = await argon2.verify(user.passwordHash, data.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isTwoFactorEnabled && user.role === 'ADMIN') {
      // Mandatory setup for ADMIN
      const tempSecret = require('crypto').randomBytes(16).toString('hex');
      await this.prisma.user.update({
        where: { id: user.id },
        data: { twoFactorTempSecret: tempSecret },
      });
      const tempToken = this.jwtService.sign({ sub: user.id, type: 'setup_2fa', sec: tempSecret }, { expiresIn: '15m' });
      return { setup2faRequired: true, temp_token: tempToken };
    }

    if (user.isTwoFactorEnabled) {
      const tempSecret = require('crypto').randomBytes(16).toString('hex');
      await this.prisma.user.update({
        where: { id: user.id },
        data: { twoFactorTempSecret: tempSecret },
      });
      const tempToken = this.jwtService.sign({ sub: user.id, type: '2fa', sec: tempSecret }, { expiresIn: '2m' });
      return { twoFactorRequired: true, temp_token: tempToken };
    }

    return this.generateTokens(user.id, user.role);
  }

  async loginWith2fa(tempToken: string, code: string) {
    let payload: any;
    try {
      payload = this.jwtService.verify(tempToken, { secret: process.env.JWT_SECRET });
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired temporary token');
    }
    
    if (payload.type !== '2fa') {
      throw new UnauthorizedException('Invalid token type');
    }

    const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user || user.twoFactorTempSecret !== payload.sec) {
      throw new UnauthorizedException('Token already used or user not found');
    }

    // Verify TOTP or backup code
    let isCodeValid = false;
    
    // First, try standard TOTP
    if (code.length === 6) {
      isCodeValid = this.twoFactorAuthService.isTwoFactorAuthenticationCodeValid(code, user);
    } 
    // Then try backup codes (assuming they are exactly 8 chars long)
    else if (code.length === 8 && user.backupCodes.length > 0) {
      for (const hash of user.backupCodes) {
        if (await argon2.verify(hash, code)) {
          isCodeValid = true;
          // Invalidate the used backup code
          await this.prisma.user.update({
            where: { id: user.id },
            data: {
              backupCodes: {
                set: user.backupCodes.filter(c => c !== hash),
              }
            }
          });
          break;
        }
      }
    }

    if (!isCodeValid) {
      throw new UnauthorizedException('Wrong authentication code');
    }

    // Invalidate the temp token
    await this.prisma.user.update({
      where: { id: user.id },
      data: { twoFactorTempSecret: null },
    });

    return this.generateTokens(user.id, user.role);
  }

  async verifySetupToken(tempToken: string): Promise<string> {
    let payload: any;
    try {
      payload = this.jwtService.verify(tempToken, { secret: process.env.JWT_SECRET });
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired temporary token');
    }
    if (payload.type !== 'setup_2fa') {
      throw new UnauthorizedException('Invalid token type');
    }
    const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user || user.twoFactorTempSecret !== payload.sec) {
      throw new UnauthorizedException('Token already used or user not found');
    }
    return user.id;
  }

  public async generateTokens(userId: string, role: string) {
    const payload = { sub: userId, role };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
    const refreshToken = this.jwtService.sign(
      { ...payload, type: 'refresh' },
      { expiresIn: '7d' },
    );
    const refreshTokenHash = await argon2.hash(refreshToken, {
      type: argon2.argon2id,
      memoryCost: 65536,
      timeCost: 3,
      parallelism: 4,
    });
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshTokenHash },
    });
    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  async refreshToken(refreshToken: string) {
    let payload: any;
    try {
      payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_SECRET,
      });
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    if (payload.type !== 'refresh') {
      throw new UnauthorizedException('Invalid token type');
    }
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });
    if (!user || !user.refreshTokenHash) {
      throw new UnauthorizedException('User not found or no refresh token');
    }
    const isValid = await argon2.verify(
      user.refreshTokenHash,
      refreshToken,
    );
    if (!isValid) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    // Rotate refresh token: hash the new one and update the user
    const newPayload = { sub: user.id, role: user.role };
    const newAccessToken = this.jwtService.sign(newPayload, {
      expiresIn: '15m',
    });
    const newRefreshToken = this.jwtService.sign(
      { ...newPayload, type: 'refresh' },
      { expiresIn: '7d' },
    );
    const newRefreshTokenHash = await argon2.hash(newRefreshToken, {
      type: argon2.argon2id,
      memoryCost: 65536,
      timeCost: 3,
      parallelism: 4,
    });
    await this.prisma.user.update({
      where: { id: user.id },
      data: { refreshTokenHash: newRefreshTokenHash },
    });
    return {
      access_token: newAccessToken,
      refresh_token: newRefreshToken,
    };
  }

  async logout(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshTokenHash: null },
    });
  }
}
