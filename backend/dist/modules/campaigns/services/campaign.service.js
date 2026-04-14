"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CampaignService = void 0;
const common_1 = require("@nestjs/common");
const repositories_1 = require("../repositories");
let CampaignService = class CampaignService {
    constructor(campaignRepo) {
        this.campaignRepo = campaignRepo;
    }
    async createCampaign(creatorId, dto) {
        if (dto.goalAmount < 100) {
            throw new common_1.BadRequestException('Goal amount must be at least 100');
        }
        return await this.campaignRepo.create(creatorId, dto);
    }
    async getMyCampaigns(creatorId, query) {
        const page = parseInt(query.page) || 1;
        const limit = parseInt(query.limit) || 12;
        const sortBy = query.sortBy || 'created_at';
        const sortOrder = query.sortOrder || 'DESC';
        return await this.campaignRepo.findByCreatorId(creatorId, page, limit, sortBy, sortOrder);
    }
    async getCampaignById(campaignId, creatorId) {
        const campaign = await this.campaignRepo.findByIdAndCreator(campaignId, creatorId);
        if (!campaign) {
            throw new common_1.NotFoundException(`Campaign with ID ${campaignId} not found`);
        }
        return campaign;
    }
    async getPublicCampaigns(query) {
        const page = parseInt(query.page) || 1;
        const limit = Math.min(parseInt(query.limit) || 12, 50);
        const sortBy = query.sortBy || 'created_at';
        const sortOrder = query.sortOrder || 'DESC';
        return await this.campaignRepo.findPublicCampaigns(page, limit, sortBy, sortOrder, query.categoryId, query.campaignType, query.q);
    }
    async getPublicCampaignById(campaignId) {
        const campaign = await this.campaignRepo.findPublicById(campaignId);
        if (!campaign) {
            throw new common_1.NotFoundException(`Campaña con ID ${campaignId} no encontrada o no está publicada`);
        }
        return campaign;
    }
};
exports.CampaignService = CampaignService;
exports.CampaignService = CampaignService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [repositories_1.CampaignRepository])
], CampaignService);
//# sourceMappingURL=campaign.service.js.map