import { PaginationDto } from '../../../common/dto';
export declare class QueryCampaignsDto extends PaginationDto {
    status?: string;
    campaignType?: string;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
    search?: string;
}
