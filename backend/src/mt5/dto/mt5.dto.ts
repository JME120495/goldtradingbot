import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class Mt5LicenseCheckDto {
  @IsNotEmpty()
  account: string | number;

  @IsOptional()
  @IsString()
  broker?: string;
}

export class Mt5HeartbeatDto {
  @IsOptional()
  account?: string | number;

  @IsOptional()
  @IsString()
  broker?: string;

  @IsOptional()
  @IsString()
  ea?: string;
}
