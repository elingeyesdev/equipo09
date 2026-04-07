import { BaseRepository } from '../../../common/database';
import { InvestorProfile } from '../models';
import { CreateInvestorProfileDto, UpdateInvestorProfileDto } from '../dto';
import { CapitalOverview } from '../models';
export declare class InvestorProfileRepository extends BaseRepository {
    findById(id: string): Promise<InvestorProfile | null>;
    findByUserId(userId: string): Promise<InvestorProfile | null>;
    existsByUserId(userId: string): Promise<boolean>;
    countInvestmentsByInvestor(userId: string): Promise<number>;
    deleteByUserId(userId: string): Promise<boolean>;
    create(userId: string, dto: CreateInvestorProfileDto): Promise<InvestorProfile>;
    update(userId: string, dto: UpdateInvestorProfileDto): Promise<InvestorProfile | null>;
    getCapitalOverview(userId: string): Promise<CapitalOverview | null>;
}
