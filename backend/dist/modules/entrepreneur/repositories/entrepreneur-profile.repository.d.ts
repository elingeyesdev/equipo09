import { BaseRepository } from '../../../common/database';
import { EntrepreneurProfile } from '../models';
import { CreateEntrepreneurProfileDto, UpdateEntrepreneurProfileDto } from '../dto';
export declare class EntrepreneurProfileRepository extends BaseRepository {
    findById(id: string): Promise<EntrepreneurProfile | null>;
    findByUserId(userId: string): Promise<EntrepreneurProfile | null>;
    findByDisplayName(displayName: string): Promise<EntrepreneurProfile | null>;
    create(userId: string, dto: CreateEntrepreneurProfileDto): Promise<EntrepreneurProfile>;
    update(userId: string, dto: UpdateEntrepreneurProfileDto): Promise<EntrepreneurProfile | null>;
    existsByUserId(userId: string): Promise<boolean>;
    countCampaignsAsCreator(userId: string): Promise<number>;
    deleteByUserId(userId: string): Promise<boolean>;
    incrementCampaignCount(userId: string): Promise<void>;
    refreshTotalRaised(userId: string): Promise<void>;
}
