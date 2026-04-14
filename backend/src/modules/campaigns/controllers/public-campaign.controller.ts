import { Controller, Get, Query, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiParam } from '@nestjs/swagger';
import { CampaignService } from '../services';

@ApiTags('Public Campaigns')
@Controller('campaigns/public')
export class PublicCampaignController {
  constructor(private readonly campaignService: CampaignService) {}

  @Get()
  @ApiOperation({ summary: 'List public campaigns (approved/published). No auth required.' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page (default: 12, max: 50)' })
  @ApiQuery({ name: 'sortBy', required: false, enum: ['created_at', 'current_amount', 'goal_amount', 'end_date'] })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['ASC', 'DESC'] })
  @ApiQuery({ name: 'categoryId', required: false, description: 'Filter by category UUID' })
  @ApiQuery({ name: 'campaignType', required: false, enum: ['donation', 'reward', 'equity'] })
  @ApiQuery({ name: 'q', required: false, description: 'Search by title or description' })
  async getPublicCampaigns(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: string,
    @Query('categoryId') categoryId?: string,
    @Query('campaignType') campaignType?: string,
    @Query('q') q?: string,
  ) {
    const result = await this.campaignService.getPublicCampaigns({
      page,
      limit,
      sortBy,
      sortOrder,
      categoryId,
      campaignType,
      q,
    });

    return {
      statusCode: 200,
      message: 'Public campaigns retrieved successfully',
      data: result,
      timestamp: new Date().toISOString(),
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get public campaign details by ID. No auth required.' })
  @ApiParam({ name: 'id', description: 'Campaign UUID' })
  async getPublicCampaignById(@Param('id') id: string) {
    const campaign = await this.campaignService.getPublicCampaignById(id);
    return {
      statusCode: 200,
      message: 'Campaign details retrieved successfully',
      data: campaign,
      timestamp: new Date().toISOString(),
    };
  }
}
