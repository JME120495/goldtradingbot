import { Module } from '@nestjs/common';
import { Mt5Service } from './mt5.service';
import { Mt5Controller } from './mt5.controller';

@Module({
  providers: [Mt5Service],
  controllers: [Mt5Controller]
})
export class Mt5Module {}
