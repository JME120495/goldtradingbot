import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { TwoFactorAuthService } from './twoFactorAuth.service';
import { MailService } from '../mail/mail.service';
import { randomBytes } from 'crypto';

import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private twoFactorAuthService: TwoFactorAuthService,
    private mailService: MailService,
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

    // Fire and forget welcome email
    this.mailService
      .sendWelcomeEmail(user.email, user.name || '')
      .catch((err) => console.error(err));

    // Automatically grant a 3-day trial license for the Starter plan
    try {
      const starterPlan = await this.prisma.productPlan.findFirst({
        where: { name: 'Starter' },
        include: { product: true }
      });
      if (starterPlan) {
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 1);
        await this.prisma.license.create({
          data: {
            userId: user.id,
            productId: starterPlan.productId,
            planId: starterPlan.id,
            status: 'ACTIVE',
            lotAllowed: starterPlan.lotAllowed,
            expiresAt: expiresAt,
          }
        });
      }
    } catch (e) {
      console.error('Failed to create trial license:', e);
    }

    return this.generateTokens(user.id, user.role);
  }

  async login(data: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: data.email },
    });
    if (!user || !user.passwordHash) {
      console.log(
        `[DEBUG LOGIN] User not found or no password hash for email: ${data.email}`,
      );
      throw new UnauthorizedException('Invalid credentials');
    }

    let isPasswordValid = false;
    let needsMigration = false;

    // Check if the hash format is bcrypt (starts with $2)
    if (user.passwordHash.startsWith('$2')) {
      const bcrypt = require('bcryptjs');
      isPasswordValid = await bcrypt.compare(data.password, user.passwordHash);
      if (isPasswordValid) {
        needsMigration = true;
      }
      console.log(
        `[DEBUG LOGIN] Bcrypt check for ${data.email} - isPasswordValid: ${isPasswordValid}`,
      );
    } else {
      isPasswordValid = await argon2.verify(user.passwordHash, data.password);
      console.log(
        `[DEBUG LOGIN] Argon2 check for ${data.email} - isPasswordValid: ${isPasswordValid}`,
      );
    }

    if (!isPasswordValid) {
      console.log(
        `[DEBUG LOGIN] Password invalid for ${data.email}, throwing UnauthorizedException.`,
      );
      throw new UnauthorizedException('Invalid credentials');
    }

    if (needsMigration) {
      console.log(`[DEBUG LOGIN] Migrating password hash for ${data.email}...`);
      const newHash = await argon2.hash(data.password, {
        type: argon2.argon2id,
        memoryCost: 65536,
        timeCost: 3,
        parallelism: 4,
      });
      await this.prisma.user.update({
        where: { id: user.id },
        data: { passwordHash: newHash },
      });
    }

    if (!user.isTwoFactorEnabled && user.role === 'ADMIN') {
      console.log(
        `[DEBUG LOGIN] Mandatory 2FA setup triggered for ADMIN: ${data.email}`,
      );
      try {
        // Mandatory setup for ADMIN
        const tempSecret = require('crypto').randomBytes(16).toString('hex');
        await this.prisma.user.update({
          where: { id: user.id },
          data: { twoFactorTempSecret: tempSecret },
        });
        const tempToken = this.jwtService.sign(
          { sub: user.id, type: 'setup_2fa', sec: tempSecret },
          { expiresIn: '15m' },
        );
        console.log(
          `[DEBUG LOGIN] Successfully generated setup token for ${data.email}`,
        );
        return { setup2faRequired: true, temp_token: tempToken };
      } catch (error) {
        console.error(
          `[DEBUG LOGIN ERROR] Error during ADMIN 2FA setup block:`,
          error,
        );
        throw error;
      }
    }

    if (user.isTwoFactorEnabled) {
      console.log(`[DEBUG LOGIN] 2FA required for user: ${data.email}`);
      try {
        const tempSecret = require('crypto').randomBytes(16).toString('hex');
        await this.prisma.user.update({
          where: { id: user.id },
          data: { twoFactorTempSecret: tempSecret },
        });
        const tempToken = this.jwtService.sign(
          { sub: user.id, type: '2fa', sec: tempSecret },
          { expiresIn: '2m' },
        );
        console.log(
          `[DEBUG LOGIN] Successfully generated 2FA token for ${data.email}`,
        );
        return { twoFactorRequired: true, temp_token: tempToken };
      } catch (error) {
        console.error(`[DEBUG LOGIN ERROR] Error during 2FA block:`, error);
        throw error;
      }
    }

    console.log(`[DEBUG LOGIN] Standard login successful for ${data.email}`);
    return this.generateTokens(user.id, user.role);
  }

  async loginWith2fa(tempToken: string, code: string) {
    let payload: any;
    try {
      payload = this.jwtService.verify(tempToken, {
        secret: process.env.JWT_SECRET,
      });
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired temporary token');
    }

    if (payload.type !== '2fa') {
      throw new UnauthorizedException('Invalid token type');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });
    if (!user || user.twoFactorTempSecret !== payload.sec) {
      throw new UnauthorizedException('Token already used or user not found');
    }

    // Verify TOTP or backup code
    let isCodeValid = false;

    // First, try standard TOTP
    if (code.length === 6) {
      isCodeValid =
        this.twoFactorAuthService.isTwoFactorAuthenticationCodeValid(
          code,
          user,
        );
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
                set: user.backupCodes.filter((c) => c !== hash),
              },
            },
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
      payload = this.jwtService.verify(tempToken, {
        secret: process.env.JWT_SECRET,
      });
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired temporary token');
    }
    if (payload.type !== 'setup_2fa') {
      throw new UnauthorizedException('Invalid token type');
    }
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });
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
    const isValid = await argon2.verify(user.refreshTokenHash, refreshToken);
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

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Return a success message anyway to prevent email enumeration
      return { message: 'If that email exists, a reset link has been sent.' };
    }

    const resetToken = randomBytes(32).toString('hex');
    const resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: resetToken,
        resetPasswordExpires,
      },
    });

    await this.mailService.sendPasswordResetEmail(user.email, resetToken);

    return { message: 'If that email exists, a reset link has been sent.' };
  }

  async resetPassword(token: string, newPassword: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: { gt: new Date() },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid or expired reset token');
    }

    const hashedPassword = await argon2.hash(newPassword, {
      type: argon2.argon2id,
      memoryCost: 65536,
      timeCost: 3,
      parallelism: 4,
    });

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      },
    });

    return { message: 'Password has been successfully reset' };
  }
}
