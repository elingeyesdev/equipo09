import { InvestorProfileRepository } from '../repositories';
import { CreateInvestorProfileDto, UpdateInvestorProfileDto } from '../dto';
import { InvestorProfile, CapitalOverview } from '../models';
export declare class InvestorService {
    private readonly profileRepo;
    private readonly logger;
    constructor(profileRepo: InvestorProfileRepository);
    createProfile(userId: string, dto: CreateInvestorProfileDto): Promise<InvestorProfile>;
    getMyProfile(userId: string): Promise<InvestorProfile>;
    getProfileById(profileId: string): Promise<InvestorProfile>;
    getCapitalOverview(userId: string): Promise<CapitalOverview>;
    updateMyProfile(userId: string, dto: UpdateInvestorProfileDto): Promise<InvestorProfile>;
}
