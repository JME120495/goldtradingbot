import { Injectable } from '@nestjs/common';
import * as speakeasy from 'speakeasy';
import * as qrcode from 'qrcode';
import { PrismaService } from '../prisma/prisma.service';
import { EncryptionService } from '../common/encryption.service';

@Injectable()
export class TwoFactorAuthService {
  constructor(
    private prisma: PrismaService,
    private encryptionService: EncryptionService
  ) {}

  public async generateTwoFactorAuthenticationSecret(user: any) {
    const appName = 'JME120495/goldtradingbot'; // App name displayed in Authenticator
    
    const secret = speakeasy.generateSecret({
      name: `${appName} (${user.email})`
    });

    const encryptedSecret = this.encryptionService.encrypt(secret.base32);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { twoFactorSecret: encryptedSecret }
    });

    return {
      secret: secret.base32,
      otpauthUrl: secret.otpauth_url
    };
  }

  public async generateQrCodeDataURL(otpauthUrl: string) {
    return qrcode.toDataURL(otpauthUrl);
  }

  public isTwoFactorAuthenticationCodeValid(twoFactorAuthenticationCode: string, user: any) {
    if (!user.twoFactorSecret) {
      return false;
    }
    
    const decryptedSecret = this.encryptionService.decrypt(user.twoFactorSecret);
    if (!decryptedSecret) {
      return false;
    }

    return speakeasy.totp.verify({
      secret: decryptedSecret,
      encoding: 'base32',
      token: twoFactorAuthenticationCode
    });
  }
}
