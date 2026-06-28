import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { Mt5Service } from './mt5.service';

@Controller('mt5')
export class Mt5Controller {
  constructor(private readonly mt5Service: Mt5Service) {}

  @Post('check-license')
  @HttpCode(HttpStatus.OK)
  async checkLicense(@Body() body: any) {
    return this.mt5Service.checkLicense(body);
  }

  @Post('heartbeat')
  @HttpCode(HttpStatus.OK)
  async heartbeat(@Body() body: any) {
    return this.mt5Service.heartbeat(body);
  }
}
