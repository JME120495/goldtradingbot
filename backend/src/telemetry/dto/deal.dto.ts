import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class DealDto {
  @IsNotEmpty()
  ticket: string | number;

  @IsNotEmpty()
  account: string | number;

  @IsOptional()
  @IsString()
  ea?: string;

  @IsOptional()
  @IsString()
  symbol?: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsNumber()
  volume?: number;

  @IsOptional()
  @IsNumber()
  openPrice?: number;

  @IsOptional()
  @IsNumber()
  closePrice?: number;

  @IsOptional()
  @IsString()
  openTime?: string;

  @IsOptional()
  @IsString()
  closeTime?: string;

  @IsOptional()
  @IsNumber()
  profit?: number;

  @IsOptional()
  @IsNumber()
  commission?: number;

  @IsOptional()
  @IsNumber()
  swap?: number;

  @IsOptional()
  @IsNumber()
  stopLoss?: number;

  @IsOptional()
  @IsNumber()
  takeProfit?: number;
}
