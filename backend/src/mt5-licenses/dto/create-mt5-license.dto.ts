import { IsString, IsOptional, IsNumber, IsDateString } from 'class-validator';

export class CreateMt5LicenseDto {
  @IsString()
  client_name: string;

  @IsString()
  client_email: string;

  @IsOptional()
  @IsString()
  client_whatsapp?: string;

  @IsNumber()
  account_number: number;

  @IsOptional()
  @IsString()
  broker?: string;

  @IsOptional()
  @IsString()
  server?: string;

  @IsOptional()
  @IsString()
  ea_name?: string;

  @IsString()
  plan: string;

  @IsNumber()
  lot: number;

  @IsDateString()
  expiry_date: string; // ISO date string (YYYY-MM-DD)
}
