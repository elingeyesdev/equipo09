import { IsString, IsNotEmpty, IsOptional, IsNumber, Min, IsEnum, IsUUID, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCampaignDto {
  @ApiProperty({ example: 'Eco-friendly Water Bottles' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'We are creating the most sustainable water bottle.' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiPropertyOptional({ example: 'Sustainable bottles' })
  @IsString()
  @IsOptional()
  shortDescription?: string;

  @ApiProperty({ example: 'uuid-of-category' })
  @IsUUID()
  @IsNotEmpty()
  categoryId: string;

  @ApiProperty({ example: 10000 })
  @IsNumber()
  @Min(100)
  goalAmount: number;

  @ApiProperty({ enum: ['donation', 'reward', 'equity'] })
  @IsEnum(['donation', 'reward', 'equity'])
  campaignType: 'donation' | 'reward' | 'equity';

  @ApiPropertyOptional()
  @IsOptional()
  endDate?: string;
}

export class QueryCampaignsDto {
  @ApiPropertyOptional()
  @IsOptional()
  page?: string;

  @ApiPropertyOptional()
  @IsOptional()
  limit?: string;

  @ApiPropertyOptional()
  @IsOptional()
  sortBy?: string;

  @ApiPropertyOptional({ enum: ['ASC', 'DESC'] })
  @IsOptional()
  @IsEnum(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC';

  @ApiPropertyOptional()
  @IsOptional()
  status?: string;

  @ApiPropertyOptional()
  @IsOptional()
  q?: string;

  @ApiPropertyOptional()
  @IsOptional()
  categoryId?: string;
}
