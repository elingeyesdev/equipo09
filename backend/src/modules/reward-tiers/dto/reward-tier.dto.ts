import { IsString, IsNumber, IsOptional, IsUUID, IsBoolean, IsArray, IsPositive, Min, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateRewardTierDto {
  @ApiProperty({ example: 'Bronce' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'Acceso anticipado y agradecimiento' })
  @IsString()
  description: string;

  @ApiProperty({ example: 50.0 })
  @IsNumber()
  @IsPositive()
  amount: number;

  @ApiPropertyOptional({ example: 'USD' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({ example: 100, description: 'Null for unlimited' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  maxClaims?: number | null;

  @ApiPropertyOptional({ example: '2026-12-31' })
  @IsOptional()
  @IsDateString()
  estimatedDelivery?: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  includesShipping?: boolean;

  @ApiPropertyOptional({ example: 'Envío internacional incluido' })
  @IsOptional()
  @IsString()
  shippingDetails?: string;

  @ApiPropertyOptional({ example: 'https://example.com/image.png' })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional({ example: '2026-12-31' })
  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @ApiPropertyOptional({ example: [{ item: 'Sticker', qty: 1 }] })
  @IsOptional()
  @IsArray()
  items?: any[];

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsNumber()
  sortOrder?: number;
}

export class UpdateRewardTierDto extends CreateRewardTierDto {
  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
