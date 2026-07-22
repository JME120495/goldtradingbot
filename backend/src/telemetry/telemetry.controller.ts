import { Controller, Post, Get, Body, Param, UseGuards, HttpCode, HttpStatus, BadRequestException } from '@nestjs/common';
import { TelemetryService } from './telemetry.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('api/telemetry')
export class TelemetryController {
  constructor(private readonly telemetryService: TelemetryService) {}

  @Post('snapshot')
  @HttpCode(HttpStatus.OK)
  async snapshot(@Body() body: any) {
    try {
      return await this.telemetryService.processSnapshot(body);
    } catch (e: any) {
      throw new BadRequestException({ error: e.message || 'Erreur lors du traitement du snapshot.' });
    }
  }

  @Post('deal')
  @HttpCode(HttpStatus.OK)
  async deal(@Body() body: any) {
    try {
      return await this.telemetryService.processDeal(body);
    } catch (e: any) {
      throw new BadRequestException({ error: e.message || 'Erreur lors du traitement du deal.' });
    }
  }

  @Get('admin/:account')
  @UseGuards(AuthGuard('jwt'))
  async getAdminStats(@Param('account') accountStr: string) {
    const account = parseInt(accountStr, 10);
    if (isNaN(account)) {
      throw new BadRequestException({ error: 'Compte invalide.' });
    }
    return this.telemetryService.getAdminStats(account);
  }
}
