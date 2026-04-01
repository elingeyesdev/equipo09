import { IsOptional, IsString, IsIn } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '../../../common/dto';

/**
 * DTO para filtrar campañas del emprendedor (EDT 1.3).
 * Extiende PaginationDto para reutilizar page/limit/offset.
 */
export class QueryCampaignsDto extends PaginationDto {
  @ApiPropertyOptional({
    enum: [
      'draft', 'pending_review', 'in_review', 'approved', 'rejected',
      'published', 'funded', 'partially_funded', 'failed',
      'cancelled', 'completed', 'suspended',
    ],
    description: 'Filtrar por estado de campaña',
  })
  @IsOptional()
  @IsString()
  @IsIn([
    'draft', 'pending_review', 'in_review', 'approved', 'rejected',
    'published', 'funded', 'partially_funded', 'failed',
    'cancelled', 'completed', 'suspended',
  ])
  status?: string;

  @ApiPropertyOptional({
    enum: ['donation', 'reward', 'equity'],
    description: 'Filtrar por tipo de campaña',
  })
  @IsOptional()
  @IsString()
  @IsIn(['donation', 'reward', 'equity'])
  campaignType?: string;

  @ApiPropertyOptional({
    enum: ['created_at', 'current_amount', 'goal_amount', 'end_date', 'title'],
    default: 'created_at',
    description: 'Campo de ordenamiento',
  })
  @IsOptional()
  @IsString()
  @IsIn(['created_at', 'current_amount', 'goal_amount', 'end_date', 'title'])
  sortBy?: string = 'created_at';

  @ApiPropertyOptional({
    enum: ['ASC', 'DESC'],
    default: 'DESC',
    description: 'Dirección de ordenamiento',
  })
  @IsOptional()
  @IsString()
  @IsIn(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC' = 'DESC';

  @ApiPropertyOptional({ description: 'Buscar por título (parcial)' })
  @IsOptional()
  @IsString()
  search?: string;
}
