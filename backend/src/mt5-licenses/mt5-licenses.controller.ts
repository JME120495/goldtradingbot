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
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Throttle } from '@nestjs/throttler';
import { Mt5LicensesService } from './mt5-licenses.service';
import { VerifyLicenseDto } from './dto/verify-license.dto';
import { CreateMt5LicenseDto } from './dto/create-mt5-license.dto';
import type { Request } from 'express';

@Controller('api/license')
export class Mt5LicensesController {
  constructor(private readonly mt5LicensesService: Mt5LicensesService) {}

  // ----------------------------------------------------------
  //  POST /api/license/verify
  //  PUBLIC — called by the EA. Rate-limited: 30 req / 60s per IP.
  //  Response format: { valid, plan?, lot?, expiry?, message }
  // ----------------------------------------------------------
  @Post('verify')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 30, ttl: 60000 } })
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
}
