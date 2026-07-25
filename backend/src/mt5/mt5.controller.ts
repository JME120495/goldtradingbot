import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { Mt5Service } from './mt5.service';
import { Mt5LicenseCheckDto, Mt5HeartbeatDto } from './dto/mt5.dto';

@Controller('mt5')
export class Mt5Controller {
  constructor(private readonly mt5Service: Mt5Service) {}

  @Post('check-license')
  @HttpCode(HttpStatus.OK)
  async checkLicense(@Body() body: Mt5LicenseCheckDto) {
    return this.mt5Service.checkLicense(body);
  }

  @Post('heartbeat')
  @HttpCode(HttpStatus.OK)
  async heartbeat(@Body() body: Mt5HeartbeatDto) {
    return this.mt5Service.heartbeat(body);
  }
}
