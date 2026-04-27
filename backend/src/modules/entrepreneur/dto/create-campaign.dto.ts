import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsEnum,
  Min,
  IsUUID,
  MaxLength,
  IsDateString,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

function emptyToUndefined({ value }: { value: unknown }): unknown {
  if (value === '' || value === null) return undefined;
  return value;
}

export enum CampaignType {
  DONATION = 'donation',
  REWARD = 'reward',
  EQUITY = 'equity',
}

export class CreateCampaignDto {
  @ApiProperty({ example: 'My Awesome Project' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @ApiProperty({ example: 'A detailed description of the campaign...' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiPropertyOptional({ example: 'Short summary' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  shortDescription?: string;

  @ApiProperty({ example: 50000 })
  @IsNumber()
  @Min(1)
  goalAmount: number;

  @ApiProperty({ enum: CampaignType, example: CampaignType.REWARD })
  @IsEnum(CampaignType)
  campaignType: CampaignType;

  @ApiPropertyOptional({ example: '2026-12-31T23:59:59Z' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ example: 'uuid-string' })
  @IsOptional()
  @Transform(emptyToUndefined)
  @IsUUID()
  categoryId?: string;

  @ApiPropertyOptional({ type: 'array', items: { type: 'object' } })
  @IsOptional()
  rewards?: any[];
}
