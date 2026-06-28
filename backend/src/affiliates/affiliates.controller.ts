import { Controller, Post, Get, UseGuards, Request } from '@nestjs/common';
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
}
