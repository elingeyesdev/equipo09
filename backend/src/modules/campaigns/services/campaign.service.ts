import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CampaignRepository, PaginatedCampaigns } from '../repositories';
import { EntrepreneurCampaign, CreateCampaignDto, QueryCampaignsDto } from '../models';

@Injectable()
export class CampaignService {
  constructor(private readonly campaignRepo: CampaignRepository) {}

  async createCampaign(creatorId: string, dto: CreateCampaignDto): Promise<EntrepreneurCampaign> {
    if (dto.goalAmount < 100) {
      throw new BadRequestException('Goal amount must be at least 100');
    }

    return await this.campaignRepo.create(creatorId, dto);
  }

  async getMyCampaigns(creatorId: string, query: QueryCampaignsDto): Promise<PaginatedCampaigns> {
    const page = parseInt(query.page as any) || 1;
    const limit = parseInt(query.limit as any) || 12;
    const sortBy = query.sortBy || 'created_at';
    const sortOrder = query.sortOrder || 'DESC';

    return await this.campaignRepo.findByCreatorId(creatorId, page, limit, sortBy, sortOrder);
  }

  async getCampaignById(campaignId: string, creatorId: string): Promise<EntrepreneurCampaign> {
    const campaign = await this.campaignRepo.findByIdAndCreator(campaignId, creatorId);
    if (!campaign) {
      throw new NotFoundException(`Campaign with ID ${campaignId} not found`);
    }
    return campaign;
  }

  // =========================================================================
  // CAMPAÑAS PÚBLICAS — Sin autenticación
  // =========================================================================

  async getPublicCampaigns(query: {
    page?: any;
    limit?: any;
    sortBy?: string;
    sortOrder?: string;
    categoryId?: string;
    campaignType?: string;
    q?: string;
  }): Promise<PaginatedCampaigns> {
    const page = parseInt(query.page) || 1;
    const limit = Math.min(parseInt(query.limit) || 12, 50); // max 50 por página
    const sortBy = query.sortBy || 'created_at';
    const sortOrder = query.sortOrder || 'DESC';

    return await this.campaignRepo.findPublicCampaigns(
      page,
      limit,
      sortBy,
      sortOrder,
      query.categoryId,
      query.campaignType,
      query.q,
    );
  }

  async getPublicCampaignById(campaignId: string): Promise<any> {
    const campaign = await this.campaignRepo.findPublicById(campaignId);
    if (!campaign) {
      throw new NotFoundException(`Campaña con ID ${campaignId} no encontrada o no está publicada`);
    }
    return campaign;
  }
}
