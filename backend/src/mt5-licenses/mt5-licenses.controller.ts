import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  Req,
  HttpCode,
  HttpStatus,
  UseGuards,
  BadRequestException,
  Delete,
  Param,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Throttle } from '@nestjs/throttler';
import { Mt5LicensesService } from './mt5-licenses.service';
import { VerifyLicenseDto } from './dto/verify-license.dto';
import { CreateMt5LicenseDto } from './dto/create-mt5-license.dto';
import { SyncHistoryDto } from './dto/sync-history.dto';
import type { Request } from 'express';

@Controller('api/license')
export class Mt5LicensesController {
  constructor(private readonly mt5LicensesService: Mt5LicensesService) {}

  // ----------------------------------------------------------
  //  POST /api/license/verify
  //  PUBLIC — called by the EA. Rate-limited: 300 req / 60s per IP to allow multiple charts.
  //  Response format: { valid, plan?, lot?, expiry?, message }
  // ----------------------------------------------------------
  @Post('verify')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 300, ttl: 60000 } })
  async verify(@Body() body: VerifyLicenseDto, @Req() req: Request) {
    if (!body.account) {
      return { valid: false, message: 'Compte manquant.' };
    }

    const clientIp =
      (req.headers['x-forwarded-for'] as string) ||
      req.socket?.remoteAddress ||
      '';

    return this.mt5LicensesService.verifyLicense(
      body.account,
      body.broker,
      body.server,
      body.ea,
      clientIp,
    );
  }

  // ----------------------------------------------------------
  //  Admin routes — JWT-protected
  // ----------------------------------------------------------

  @Post('admin/create')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  async createLicense(@Body() body: CreateMt5LicenseDto) {
    if (
      !body.client_name ||
      !body.client_email ||
      !body.account_number ||
      !body.plan ||
      !body.lot ||
      !body.expiry_date
    ) {
      throw new BadRequestException('Champs obligatoires manquants.');
    }
    return this.mt5LicensesService.createOrRenewLicense(body);
  }

  @Post('admin/suspend')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  async suspendLicense(
    @Body() body: { account_number: number; ea_name?: string },
  ) {
    if (!body.account_number) {
      throw new BadRequestException('account_number requis.');
    }
    return this.mt5LicensesService.suspendLicense(
      body.account_number,
      body.ea_name,
    );
  }

  @Post('admin/reactivate')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  async reactivateLicense(
    @Body() body: { account_number: number; ea_name?: string },
  ) {
    if (!body.account_number) {
      throw new BadRequestException('account_number requis.');
    }
    return this.mt5LicensesService.reactivateLicense(
      body.account_number,
      body.ea_name,
    );
  }

  @Delete('admin/delete/:id')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  async deleteLicense(@Param('id') id: string) {
    const licenseId = parseInt(id, 10);
    if (isNaN(licenseId)) {
      throw new BadRequestException('ID invalide.');
    }
    return this.mt5LicensesService.deleteLicense(licenseId);
  }

  @Post('admin/bulk-action')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  async bulkAction(
    @Body() body: { ids: number[]; action: 'delete' | 'suspend' | 'reactivate' },
  ) {
    if (!body.ids || !Array.isArray(body.ids) || !body.action) {
      throw new BadRequestException('Paramètres invalides.');
    }
    return this.mt5LicensesService.bulkActionMt5Licenses(body.ids, body.action);
  }

  @Get('admin/list')
  @UseGuards(AuthGuard('jwt'))
  async listLicenses(
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
    @Query('search') search?: string,
  ) {
    return this.mt5LicensesService.listLicenses(
      parseInt(limit || '50', 10),
      parseInt(offset || '0', 10),
      search,
    );
  }

  // ----------------------------------------------------------
  //  History Endpoints
  // ----------------------------------------------------------

  @Post('sync-history')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 60, ttl: 60000 } })
  async syncHistory(@Body() body: SyncHistoryDto) {
    if (!body.account) {
      throw new BadRequestException('Compte manquant.');
    }
    return this.mt5LicensesService.syncHistory(body);
  }

  @Get('admin/history/:account')
  @UseGuards(AuthGuard('jwt'))
  async getAccountHistory(@Req() req: Request) {
    const accountNumber = parseInt(req.params.account as string, 10);
    if (isNaN(accountNumber)) {
      throw new BadRequestException('Numéro de compte invalide.');
    }
    return this.mt5LicensesService.getAccountHistory(accountNumber);
  }
}
