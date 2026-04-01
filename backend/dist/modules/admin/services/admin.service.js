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
const admin_repository_1 = require("../repositories/admin.repository");
const repositories_1 = require("../../users/repositories");
let AdminService = class AdminService {
    constructor(adminRepo, userRepo) {
        this.adminRepo = adminRepo;
        this.userRepo = userRepo;
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
    async updateCampaignStatus(campaignId, status) {
        const updated = await this.adminRepo.updateCampaignStatus(campaignId, status);
        if (!updated) {
            throw new common_1.NotFoundException('Campaña no encontrada');
        }
        return updated;
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
    async hardDeleteCampaign(campaignId) {
        try {
            const deleted = await this.adminRepo.hardDeleteCampaign(campaignId);
            if (!deleted)
                throw new common_1.NotFoundException('Campaña no encontrada');
            return deleted;
        }
        catch (err) {
            if (err.code === '23503') {
                return this.adminRepo.updateCampaignStatus(campaignId, 'cancelled');
            }
            throw err;
        }
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [admin_repository_1.AdminRepository,
        repositories_1.UserRepository])
], AdminService);
//# sourceMappingURL=admin.service.js.map