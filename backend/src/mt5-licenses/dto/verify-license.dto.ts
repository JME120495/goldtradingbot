import { IsNumber, IsOptional, IsString } from 'class-validator';

export class VerifyLicenseDto {
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
