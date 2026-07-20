import { IsNumber, IsString, IsArray, ValidateNested, IsOptional, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

export class Mt5TradeDto {
  @IsNumber()
  ticket: number;

  @IsString()
  symbol: string;

  @IsString()
  type: string;

  @IsNumber()
  volume: number;

  @IsNumber()
  openPrice: number;

  @IsNumber()
  closePrice: number;

  @IsDateString()
  openTime: string;

  @IsDateString()
  closeTime: string;

  @IsNumber()
  profit: number;

  @IsNumber()
  commission: number;

  @IsNumber()
  swap: number;
}

export class SyncHistoryDto {
  @IsNumber()
  account: number;

  @IsString()
  ea: string;

  @IsNumber()
  balance: number;

  @IsNumber()
  equity: number;

  @IsNumber()
  margin: number;

  @IsNumber()
  freeMargin: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Mt5TradeDto)
  trades?: Mt5TradeDto[];
}
