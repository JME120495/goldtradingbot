import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TelegramService } from '../telegram/telegram.service';

@Injectable()
export class SupportService {
  constructor(
    private prisma: PrismaService,
    private telegram: TelegramService,
  ) {}

  async createTicket(userId: string, data: { subject: string, message: string }) {
    const ticket = await this.prisma.supportTicket.create({
      data: {
        userId,
        subject: data.subject,
        message: data.message,
        status: 'OPEN'
      },
      include: { user: { select: { email: true, name: true } } }
    });

    this.telegram.sendMessage(`🎫 <b>Nouveau Ticket de Support</b>\n\n<b>Client:</b> ${ticket.user.name || ticket.user.email}\n<b>Sujet:</b> ${ticket.subject}\n<b>Message:</b>\n${ticket.message}`);

    return ticket;
  }

  async getUserTickets(userId: string) {
    return this.prisma.supportTicket.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getAllTickets() {
    return this.prisma.supportTicket.findMany({
      include: {
        user: {
          select: { name: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async updateTicketStatus(id: string, status: string) {
    const ticket = await this.prisma.supportTicket.findUnique({ where: { id } });
    if (!ticket) throw new NotFoundException('Ticket not found');

    return this.prisma.supportTicket.update({
      where: { id },
      data: { status }
    });
  }
}
