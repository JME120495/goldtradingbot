import { Controller, Get, Patch, Delete, Param, Body, Post } from '@nestjs/common';
import { AdminService } from './admin.service';

@Controller('admin')
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('affiliates')
  getAffiliates() {
    return this.adminService.getAffiliates();
  }

  @Patch('affiliates/:id/commission')
  updateAffiliateCommission(@Param('id') id: string, @Body('rate') rate: number) {
    return this.adminService.updateAffiliateCommission(id, rate);
  }

  @Patch('affiliates/:id/status')
  updateAffiliateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.adminService.updateAffiliateStatus(id, status);
  }

  @Delete('affiliates/:id')
  deleteAffiliate(@Param('id') id: string) {
    return this.adminService.deleteAffiliate(id);
  }

  @Post('affiliates')
  createAffiliate(@Body('email') email: string) {
    return this.adminService.createAffiliateManually(email);
  }

  @Get('licenses')
  getLicenses() {
    return this.adminService.getLicenses();
  }

  @Patch('licenses/:id/status')
  updateLicenseStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.adminService.updateLicenseStatus(id, status);
  }

  @Post('licenses')
  createLicense(@Body() body: { email: string, planId: string, durationDays: number }) {
    return this.adminService.createLicenseManually(body.email, body.planId, body.durationDays);
  }

  @Get('plans')
  getPlans() {
    return this.adminService.getPlans();
  }

  @Post('seed')
  seedProducts() {
    return this.adminService.seedProducts();
  }
}
