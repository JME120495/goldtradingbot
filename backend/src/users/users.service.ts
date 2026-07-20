import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as argon2 from 'argon2';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        licenses: {
          include: {
            product: true,
            plan: true,
            tradingAccount: true
          },
          orderBy: { createdAt: 'desc' }
        }
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async updateMe(userId: string, data: any) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        name: data.name,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });
  }

  async changePassword(userId: string, data: any) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.passwordHash) {
      throw new NotFoundException('Utilisateur introuvable ou compte externe.');
    }

    const isPasswordValid = await argon2.verify(user.passwordHash, data.currentPassword);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Le mot de passe actuel est incorrect.');
    }

    const hashedPassword = await argon2.hash(data.newPassword);

    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash: hashedPassword },
    });

    return { message: 'Mot de passe modifié avec succès.' };
  }
}
