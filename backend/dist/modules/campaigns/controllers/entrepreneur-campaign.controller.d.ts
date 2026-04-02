import { CampaignService } from '../services';
import { CreateCampaignDto, QueryCampaignsDto } from '../dto';
export declare class EntrepreneurCampaignsController {
    private readonly campaignService;
    constructor(campaignService: CampaignService);
    createCampaign(req: any, dto: CreateCampaignDto): Promise<{
        statusCode: number;
        message: string;
        data: import("../models").EntrepreneurCampaign;
        timestamp: string;
    }>;
    getMyCampaigns(req: any, query: QueryCampaignsDto): Promise<{
        statusCode: number;
        message: string;
        data: import("../repositories").PaginatedCampaigns;
        timestamp: string;
    }>;
    getCampaignById(req: any, id: string): Promise<{
        statusCode: number;
        message: string;
        data: import("../models").EntrepreneurCampaign;
        timestamp: string;
    }>;
}
