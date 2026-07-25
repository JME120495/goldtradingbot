import { Controller, Post, Body, HttpCode, HttpStatus, Req, Res, UseGuards, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { TwoFactorAuthService } from './twoFactorAuth.service';
import { PrismaService } from '../prisma/prisma.service';
import type { Request, Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import * as argon2 from 'argon2';
import * as crypto from 'crypto';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Throttle } from '@nestjs/throttler';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly twoFactorAuthService: TwoFactorAuthService,
    private readonly prisma: PrismaService
  ) {}

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('register')
  async register(@Body() body: RegisterDto, @Res({ passthrough: true }) res: Response) {
    const tokens = await this.authService.register(body);
    res.cookie('refreshToken', tokens.refresh_token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      path: '/api/auth/refresh'
    });
    return { access_token: tokens.access_token };
  }

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('login')
  async login(@Body() body: LoginDto, @Res({ passthrough: true }) res: Response) {
    const tokens = await this.authService.login(body) as any;
    if (tokens.twoFactorRequired) {
      return tokens;
    }
    res.cookie('refreshToken', tokens.refresh_token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      path: '/api/auth/refresh'
    });
    return { access_token: tokens.access_token };
  }

  @Throttle({ default: { limit: 5, ttl: 300000 } })
  @Post('login/2fa')
  @HttpCode(HttpStatus.OK)
  async loginWith2fa(@Body() body: { temp_token: string; code: string }, @Res({ passthrough: true }) res: Response) {
    const tokens = await this.authService.loginWith2fa(body.temp_token, body.code);
    res.cookie('refreshToken', tokens.refresh_token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      path: '/api/auth/refresh'
    });
    return { access_token: tokens.access_token };
  }

  @Throttle({ default: { limit: 20, ttl: 60000 } })
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      throw new UnauthorizedException('No refresh token provided');
    }
    const tokens = await this.authService.refreshToken(refreshToken);
    res.cookie('refreshToken', tokens.refresh_token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      path: '/api/auth/refresh'
    });
    return { access_token: tokens.access_token };
  }

  @Post('logout')
  @UseGuards(AuthGuard('jwt'))
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const user = req.user as any;
    const userId = user?.['sub'];
    await this.authService.logout(userId);
    res.clearCookie('refreshToken', { path: '/api/auth/refresh', sameSite: 'none', secure: true, httpOnly: true });
    return { message: 'Logged out successfully' };
  }

  @Post('2fa/generate')
  @UseGuards(AuthGuard('jwt'))
  async generate2fa(@Req() req: Request) {
    const user = await this.prisma.user.findUnique({ where: { id: (req.user as any)['sub'] } });
    if (!user) throw new UnauthorizedException();
    const { otpauthUrl } = await this.twoFactorAuthService.generateTwoFactorAuthenticationSecret(user);
    const qrCodeUrl = await this.twoFactorAuthService.generateQrCodeDataURL(otpauthUrl as string);
    return { qrCodeUrl };
  }

  @Post('2fa/turn-on')
  @UseGuards(AuthGuard('jwt'))
  async turnOn2fa(@Req() req: Request, @Body() body: { code: string }) {
    const user = await this.prisma.user.findUnique({ where: { id: (req.user as any)['sub'] } });
    if (!user) throw new UnauthorizedException();
    const isCodeValid = this.twoFactorAuthService.isTwoFactorAuthenticationCodeValid(body.code, user);
    if (!isCodeValid) {
      throw new UnauthorizedException('Wrong authentication code');
    }
    
    // Generate backup codes
    const plainBackupCodes: string[] = [];
    const hashedBackupCodes: string[] = [];
    
    for (let i = 0; i < 10; i++) {
      const code = crypto.randomBytes(4).toString('hex'); // 8 hex chars
      plainBackupCodes.push(code);
      const hash = await argon2.hash(code);
      hashedBackupCodes.push(hash);
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { 
        isTwoFactorEnabled: true,
        backupCodes: hashedBackupCodes
      }
    });
    
    return { success: true, backupCodes: plainBackupCodes };
  }

  @Post('2fa/turn-off')
  @UseGuards(AuthGuard('jwt'))
  async turnOff2fa(@Req() req: Request, @Body() body: { password?: string, code: string }) {
    const user = await this.prisma.user.findUnique({ where: { id: (req.user as any)['sub'] } });
    if (!user || !user.passwordHash) throw new UnauthorizedException();
    
    if (!body.password) {
      throw new UnauthorizedException('Password is required to disable 2FA');
    }
    
    const isPasswordValid = await argon2.verify(user.passwordHash, body.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid password');
    }

    const isCodeValid = this.twoFactorAuthService.isTwoFactorAuthenticationCodeValid(body.code, user);
    if (!isCodeValid) {
      throw new UnauthorizedException('Wrong authentication code');
    }
    
    await this.prisma.user.update({
      where: { id: user.id },
      data: { isTwoFactorEnabled: false, twoFactorSecret: null, backupCodes: [] }
    });
    return { success: true };
  }

  @Post('setup-2fa/generate')
  async setupGenerate2fa(@Body() body: { temp_token: string }) {
    const userId = await this.authService.verifySetupToken(body.temp_token);
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException();
    const { otpauthUrl } = await this.twoFactorAuthService.generateTwoFactorAuthenticationSecret(user);
    const qrCodeUrl = await this.twoFactorAuthService.generateQrCodeDataURL(otpauthUrl as string);
    return { qrCodeUrl };
  }

  @Post('setup-2fa/turn-on')
  async setupTurnOn2fa(@Body() body: { temp_token: string, code: string }) {
    const userId = await this.authService.verifySetupToken(body.temp_token);
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException();
    
    const isCodeValid = this.twoFactorAuthService.isTwoFactorAuthenticationCodeValid(body.code, user);
    if (!isCodeValid) {
      throw new UnauthorizedException('Wrong authentication code');
    }
    
    const plainBackupCodes: string[] = [];
    const hashedBackupCodes: string[] = [];
    
    for (let i = 0; i < 10; i++) {
      const code = crypto.randomBytes(4).toString('hex');
      plainBackupCodes.push(code);
      const hash = await argon2.hash(code);
      hashedBackupCodes.push(hash);
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { 
        isTwoFactorEnabled: true,
        backupCodes: hashedBackupCodes,
        twoFactorTempSecret: null
      }
    });
    
    // Automatically log the user in
    const tokens = await this.authService.generateTokens(user.id, user.role);

    return { success: true, backupCodes: plainBackupCodes, access_token: tokens.access_token, refresh_token: tokens.refresh_token };
  }
}
