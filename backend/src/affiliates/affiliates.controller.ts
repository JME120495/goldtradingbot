import { Controller, Post, Get, Put, Body, UseGuards, Request } from '@nestjs/common';
import { AffiliatesService } from './affiliates.service';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('affiliates')
export class AffiliatesController {
  constructor(private readonly affiliatesService: AffiliatesService) {}

  @Post('join')
  async join(@Request() req) {
    return this.affiliatesService.joinProgram(req.user.userId);
  }

  @Get('stats')
  async getStats(@Request() req) {
    return this.affiliatesService.getStats(req.user.userId);
  }

  @Put('wallet')
  async updateWallet(@Request() req, @Body('walletAddress') walletAddress: string) {
    return this.affiliatesService.updateWallet(req.user.userId, walletAddress);
  }

  @Post('withdraw')
  async requestWithdrawal(@Request() req, @Body('amount') amount: number) {
    return this.affiliatesService.requestWithdrawal(req.user.userId, amount);
  }
}
