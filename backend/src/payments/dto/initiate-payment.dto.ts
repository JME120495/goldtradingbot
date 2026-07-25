import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

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
}
