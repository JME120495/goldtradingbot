import { Controller, Get, Patch, Delete, Param, Body } from '@nestjs/common';
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

  @Delete('affiliates/:id')
  deleteAffiliate(@Param('id') id: string) {
    return this.adminService.deleteAffiliate(id);
  }

  @Get('licenses')
  getLicenses() {
    return this.adminService.getLicenses();
  }

  @Patch('licenses/:id/status')
  updateLicenseStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.adminService.updateLicenseStatus(id, status);
  }
}
