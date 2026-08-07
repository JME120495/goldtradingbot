import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';

import { TwoFactorAuthService } from './twoFactorAuth.service';
import { EncryptionService } from '../common/encryption.service';

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '15m' },
    }),
  ],
  providers: [
    AuthService,
    JwtStrategy,
    TwoFactorAuthService,
    EncryptionService,
  ],
  controllers: [AuthController],
})
export class AuthModule {}
