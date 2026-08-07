import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class InitiatePaymentDto {
  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsString()
  @IsNotEmpty()
  planId: string;

  @IsString()
  @IsNotEmpty()
  duration: string;

  @IsOptional()
  @IsString()
  method?: string; // 'CRYPTO' | 'MOBILE_MONEY'

  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  provider?: string;
}
