import { Controller, Get, Post, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { TradingAccountsService } from './trading-accounts.service';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('trading-accounts')
export class TradingAccountsController {
  constructor(private readonly tradingAccountsService: TradingAccountsService) {}

  @Get()
  findAll(@Request() req) {
    return this.tradingAccountsService.findAll(req.user.userId);
  }

  @Post()
  create(@Request() req, @Body() body: { accountNumber: string, broker: string, server?: string }) {
    return this.tradingAccountsService.create(req.user.userId, body);
  }

  @Delete(':id')
  delete(@Request() req, @Param('id') id: string) {
    return this.tradingAccountsService.delete(req.user.userId, id);
  }
}
