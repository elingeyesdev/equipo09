import { PaginationDto } from '../../../common/dto';
export declare class QueryCampaignsDto extends PaginationDto {
    filterPreset?: string;
    status?: string;
    campaignType?: string;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
    search?: string;
    createdFrom?: string;
    createdTo?: string;
    endDateFrom?: string;
    endDateTo?: string;
}
