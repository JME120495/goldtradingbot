import { IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class VerifyLicenseDto {
  @Type(() => Number)
  @IsNumber()
  account: number;

  @IsOptional()
  @IsString()
  broker?: string;

  @IsOptional()
  @IsString()
  server?: string;

  @IsOptional()
  @IsString()
  ea?: string;
}
