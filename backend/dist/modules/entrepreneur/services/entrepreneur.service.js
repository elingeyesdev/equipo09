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
var EntrepreneurService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EntrepreneurService = void 0;
const common_1 = require("@nestjs/common");
const exceptions_1 = require("../../../common/exceptions");
const dto_1 = require("../../../common/dto");
const repositories_1 = require("../repositories");
let EntrepreneurService = EntrepreneurService_1 = class EntrepreneurService {
    constructor(profileRepo, campaignRepo) {
        this.profileRepo = profileRepo;
        this.campaignRepo = campaignRepo;
        this.logger = new common_1.Logger(EntrepreneurService_1.name);
    }
    async createProfile(userId, dto) {
        this.logger.log(`Creando perfil de emprendedor para user ${userId}`);
        const exists = await this.profileRepo.existsByUserId(userId);
        if (exists) {
            throw new exceptions_1.ConflictException('Este usuario ya tiene un perfil de emprendedor');
        }
        const profile = await this.profileRepo.create(userId, dto);
        this.logger.log(`Perfil creado: ${profile.id} para user ${userId}`);
        return profile;
    }
    async getMyProfile(userId) {
        const profile = await this.profileRepo.findByUserId(userId);
        if (!profile) {
            throw new exceptions_1.NotFoundException('Perfil de emprendedor');
        }
        return profile;
    }
    async getProfileById(profileId) {
        const profile = await this.profileRepo.findById(profileId);
        if (!profile) {
            throw new exceptions_1.NotFoundException('Perfil de emprendedor', profileId);
        }
        return profile;
    }
    async updateMyProfile(userId, dto) {
        this.logger.log(`Actualizando perfil de emprendedor para user ${userId}`);
        const exists = await this.profileRepo.existsByUserId(userId);
        if (!exists) {
            throw new exceptions_1.NotFoundException('Perfil de emprendedor');
        }
        const updated = await this.profileRepo.update(userId, dto);
        if (!updated) {
            throw new exceptions_1.NotFoundException('Perfil de emprendedor');
        }
        this.logger.log(`Perfil actualizado: ${updated.id}`);
        return updated;
    }
    async updateProfile(profileId, requestingUserId, dto) {
        const profile = await this.profileRepo.findById(profileId);
        if (!profile) {
            throw new exceptions_1.NotFoundException('Perfil de emprendedor', profileId);
        }
        if (profile.userId !== requestingUserId) {
            throw new exceptions_1.ForbiddenException('Solo puedes editar tu propio perfil de emprendedor');
        }
        const updated = await this.profileRepo.update(profile.userId, dto);
        if (!updated) {
            throw new exceptions_1.NotFoundException('Perfil de emprendedor');
        }
        return updated;
    }
    async getMyCampaigns(userId, query) {
        await this.ensureEntrepreneurProfile(userId);
        const { campaigns, total } = await this.campaignRepo.findByCreatorId(userId, query);
        return new dto_1.PaginatedResponse(campaigns, total, query.page, query.limit);
    }
    async createCampaign(userId, dto) {
        await this.ensureEntrepreneurProfile(userId);
        this.logger.log(`Creando nueva campaña para user ${userId}: ${dto.title}`);
        const campaign = await this.campaignRepo.create(userId, dto);
        this.logger.log(`Campaña creada: ${campaign.id}`);
        return campaign;
    }
    async getMyCampaignById(userId, campaignId) {
        const campaign = await this.campaignRepo.findOneByCreatorId(campaignId, userId);
        if (!campaign) {
            throw new exceptions_1.NotFoundException('Campaña', campaignId);
        }
        return campaign;
    }
    async getCampaignFinancialProgress(userId, campaignId) {
        const progress = await this.campaignRepo.getFinancialProgress(campaignId, userId);
        if (!progress) {
            throw new exceptions_1.NotFoundException('Campaña', campaignId);
        }
        return progress;
    }
    async getMyFinancialSummary(userId) {
        await this.ensureEntrepreneurProfile(userId);
        return this.campaignRepo.getFinancialSummary(userId);
    }
    async ensureEntrepreneurProfile(userId) {
        const exists = await this.profileRepo.existsByUserId(userId);
        if (!exists) {
            throw new exceptions_1.NotFoundException('Perfil de emprendedor. Debes crear tu perfil antes de gestionar campañas');
        }
    }
};
exports.EntrepreneurService = EntrepreneurService;
exports.EntrepreneurService = EntrepreneurService = EntrepreneurService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [repositories_1.EntrepreneurProfileRepository,
        repositories_1.EntrepreneurCampaignRepository])
], EntrepreneurService);
//# sourceMappingURL=entrepreneur.service.js.map