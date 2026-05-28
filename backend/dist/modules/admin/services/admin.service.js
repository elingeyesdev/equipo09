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
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const dto_1 = require("../../../common/dto");
const admin_repository_1 = require("../repositories/admin.repository");
const repositories_1 = require("../../users/repositories");
const repositories_2 = require("../../entrepreneur/repositories");
const reward_tier_repository_1 = require("../../reward-tiers/repositories/reward-tier.repository");
const notifications_service_1 = require("../../notifications/services/notifications.service");
let AdminService = class AdminService {
    constructor(adminRepo, userRepo, campaignRepo, rewardRepo, notificationsService) {
        this.adminRepo = adminRepo;
        this.userRepo = userRepo;
        this.campaignRepo = campaignRepo;
        this.rewardRepo = rewardRepo;
        this.notificationsService = notificationsService;
    }
    async getDashboardStats() {
        return this.adminRepo.getDashboardStats();
    }
    async getAllUsers() {
        return this.adminRepo.getAllUsers();
    }
    async getAllCampaigns() {
        return this.adminRepo.getAllCampaigns();
    }
    async getPendingCampaigns(queryDto) {
        return this.adminRepo.findPendingCampaigns(queryDto);
    }
    async getCampaignDetail(id) {
        const campaign = await this.adminRepo.getCampaignDetailAdmin(id);
        if (!campaign) {
            throw new common_1.NotFoundException('Campaña no encontrada');
        }
        return campaign;
    }
    async updateCampaignStatus(campaignId, status, reviewerId, feedback) {
        if (status === 'rejected' && (!feedback || feedback.trim().length < 3)) {
            throw new common_1.BadRequestException('Debe proporcionar un feedback válido (mínimo 3 caracteres) para rechazar la campaña.');
        }
        const updated = await this.adminRepo.updateCampaignStatus(campaignId, status, reviewerId, feedback);
        if (!updated) {
            throw new common_1.NotFoundException('Campaña no encontrada');
        }
        if (status === 'approved' || status === 'rejected') {
            try {
                const entrepreneurUserId = updated.creator_id;
                const campaignTitle = updated.title;
                if (status === 'approved') {
                    await this.notificationsService.notifyCampaignApproved({
                        entrepreneurUserId,
                        campaignTitle,
                        campaignId,
                    });
                }
                else {
                    await this.notificationsService.notifyCampaignRejected({
                        entrepreneurUserId,
                        campaignTitle,
                        campaignId,
                        feedback,
                    });
                }
            }
            catch (notifErr) {
                console.error('Error sending campaign status notification:', notifErr);
            }
        }
        return updated;
    }
    async getCampaignHistory(campaignId) {
        return this.adminRepo.getCampaignHistory(campaignId);
    }
    async getCampaignFinancialProgress(campaignId) {
        return this.campaignRepo.getFinancialProgressAdmin(campaignId);
    }
    async getCampaignInvestors(campaignId, query) {
        const { investors, total } = await this.campaignRepo.getCampaignInvestors(campaignId, undefined, query);
        return new dto_1.PaginatedResponse(investors, total, query.page || 1, query.limit || 20);
    }
    async getRewardClaims(campaignId) {
        return this.rewardRepo.getRewardClaims(campaignId);
    }
    async createAdmin(email, passwordString) {
        const userExists = await this.userRepo.findByEmail(email);
        if (userExists) {
            throw new common_1.BadRequestException('El usuario ya existe');
        }
        const newUser = await this.userRepo.create({
            email,
            password: passwordString,
        });
        if (!newUser) {
            throw new common_1.BadRequestException('Error al crear usuario');
        }
        return this.adminRepo.createAdminProfile(newUser.id, 'admin');
    }
    async getAllAdmins() {
        return this.adminRepo.getAllAdmins();
    }
    async deleteAdminProfile(adminId) {
        const deleted = await this.adminRepo.deleteAdminProfile(adminId);
        if (!deleted)
            throw new common_1.NotFoundException('Perfil de administrador no encontrado');
        return deleted;
    }
    async softDeleteUser(userId) {
        const isTargetAdmin = await this.adminRepo.isUserAdmin(userId);
        if (isTargetAdmin) {
            throw new common_1.BadRequestException('Privilegios insuficientes: No puedes bloquear a otro administrador o super administrador desde este panel.');
        }
        const deleted = await this.adminRepo.softDeleteUser(userId);
        if (!deleted)
            throw new common_1.NotFoundException('Usuario no encontrado');
        return deleted;
    }
    async hardDeleteCampaign(campaignId, reviewerId) {
        try {
            const deleted = await this.adminRepo.hardDeleteCampaign(campaignId);
            if (!deleted)
                throw new common_1.NotFoundException('Campaña no encontrada');
            return deleted;
        }
        catch (err) {
            if (err.code === '23503') {
                return this.adminRepo.updateCampaignStatus(campaignId, 'cancelled', reviewerId);
            }
            throw err;
        }
    }
    async getCampaignDocuments(campaignId) {
        return this.adminRepo.getCampaignDocuments(campaignId);
    }
    async reviewCampaignDocument(campaignId, docId, status, reviewerNotes, reviewerId) {
        const updated = await this.adminRepo.reviewCampaignDocument(campaignId, docId, status, reviewerNotes, reviewerId);
        if (!updated) {
            throw new common_1.NotFoundException('Documento no encontrado o no pertenece a la campaña');
        }
        return updated;
    }
    async getPendingKyc() {
        return this.adminRepo.getPendingKyc();
    }
    async reviewKyc(entrepreneurId, action, reviewerId, reason) {
        const updated = await this.adminRepo.reviewKyc(entrepreneurId, action, reviewerId, reason);
        if (!updated) {
            throw new common_1.NotFoundException('Emprendedor no encontrado');
        }
        try {
            await this.notificationsService.notifyKycReviewed({
                entrepreneurUserId: updated.user_id,
                approved: action === 'approve',
                reason,
            });
        }
        catch (err) {
            console.error('Error sending KYC review notification:', err);
        }
        return updated;
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [admin_repository_1.AdminRepository,
        repositories_1.UserRepository,
        repositories_2.EntrepreneurCampaignRepository,
        reward_tier_repository_1.RewardTierRepository,
        notifications_service_1.NotificationsService])
], AdminService);
//# sourceMappingURL=admin.service.js.map