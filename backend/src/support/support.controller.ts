import { Controller, Post, Get, Patch, Body, Param, UseGuards, Request } from '@nestjs/common';
import { SupportService } from './support.service';
import { AuthGuard } from '@nestjs/passport';
import { AdminGuard } from '../auth/admin.guard';

@Controller('support')
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  async createTicket(@Request() req, @Body() data: { subject: string, message: string }) {
    return this.supportService.createTicket(req.user.userId, data);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get()
  async getUserTickets(@Request() req) {
    return this.supportService.getUserTickets(req.user.userId);
  }

  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @Get('admin')
  async getAllTickets() {
    return this.supportService.getAllTickets();
  }

  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @Patch('admin/:id/status')
  async updateTicketStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.supportService.updateTicketStatus(id, status);
  }
}
