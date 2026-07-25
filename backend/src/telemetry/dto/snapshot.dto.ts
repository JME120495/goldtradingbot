import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class SnapshotDto {
  @IsNotEmpty()
  account: string | number;

  @IsOptional()
  @IsString()
  ea?: string;

  @IsOptional()
  @IsNumber()
  balance?: number;

  @IsOptional()
  @IsNumber()
  equity?: number;

  @IsOptional()
  @IsNumber()
  margin?: number;

  @IsOptional()
  @IsNumber()
  freeMargin?: number;
}
