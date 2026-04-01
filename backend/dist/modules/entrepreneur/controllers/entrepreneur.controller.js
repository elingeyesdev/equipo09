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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EntrepreneurController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const passport_1 = require("@nestjs/passport");
const services_1 = require("../services");
const dto_1 = require("../dto");
const dto_2 = require("../../../common/dto");
let EntrepreneurController = class EntrepreneurController {
    constructor(entrepreneurService) {
        this.entrepreneurService = entrepreneurService;
    }
    async createProfile(req, dto) {
        const userId = req.user.id;
        const profile = await this.entrepreneurService.createProfile(userId, dto);
        return new dto_2.ApiSuccessResponse(profile, 'Perfil creado exitosamente');
    }
    async getMyProfile(req) {
        const userId = req.user.id;
        const profile = await this.entrepreneurService.getMyProfile(userId);
        return new dto_2.ApiSuccessResponse(profile);
    }
    async updateMyProfile(req, dto) {
        const userId = req.user.id;
        const profile = await this.entrepreneurService.updateMyProfile(userId, dto);
        return new dto_2.ApiSuccessResponse(profile, 'Perfil actualizado exitosamente');
    }
    async getProfileById(id) {
        const profile = await this.entrepreneurService.getProfileById(id);
        return new dto_2.ApiSuccessResponse(profile);
    }
    async getMyCampaigns(req, query) {
        const userId = req.user.id;
        const result = await this.entrepreneurService.getMyCampaigns(userId, query);
        return new dto_2.ApiSuccessResponse(result);
    }
    async getMyCampaignById(req, campaignId) {
        const userId = req.user.id;
        const campaign = await this.entrepreneurService.getMyCampaignById(userId, campaignId);
        return new dto_2.ApiSuccessResponse(campaign);
    }
    async getMyFinancialSummary(req) {
        const userId = req.user.id;
        const summary = await this.entrepreneurService.getMyFinancialSummary(userId);
        return new dto_2.ApiSuccessResponse(summary);
    }
    async getCampaignFinancialProgress(req, campaignId) {
        const userId = req.user.id;
        const progress = await this.entrepreneurService.getCampaignFinancialProgress(userId, campaignId);
        return new dto_2.ApiSuccessResponse(progress);
    }
};
exports.EntrepreneurController = EntrepreneurController;
__decorate([
    (0, common_1.Post)('me/profile'),
    (0, swagger_1.ApiOperation)({ summary: 'Crear perfil de emprendedor (EDT 1.1)' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Perfil creado exitosamente.' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'El usuario ya tiene un perfil.' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'No autenticado.' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, dto_1.CreateEntrepreneurProfileDto]),
    __metadata("design:returntype", Promise)
], EntrepreneurController.prototype, "createProfile", null);
__decorate([
    (0, common_1.Get)('me/profile'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener mi perfil de emprendedor' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Perfil retornado exitosamente.' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Perfil no encontrado.' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], EntrepreneurController.prototype, "getMyProfile", null);
__decorate([
    (0, common_1.Put)('me/profile'),
    (0, swagger_1.ApiOperation)({ summary: 'Actualizar mi perfil (EDT 1.2)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Perfil actualizado exitosamente.' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, dto_1.UpdateEntrepreneurProfileDto]),
    __metadata("design:returntype", Promise)
], EntrepreneurController.prototype, "updateMyProfile", null);
__decorate([
    (0, common_1.Get)(':id/profile'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener perfil público de un emprendedor' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EntrepreneurController.prototype, "getProfileById", null);
__decorate([
    (0, swagger_1.ApiTags)('entrepreneur-campaigns'),
    (0, common_1.Get)('me/campaigns'),
    (0, swagger_1.ApiOperation)({ summary: 'Listar mis campañas (EDT 1.3)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Lista paginada de campañas.' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, dto_1.QueryCampaignsDto]),
    __metadata("design:returntype", Promise)
], EntrepreneurController.prototype, "getMyCampaigns", null);
__decorate([
    (0, swagger_1.ApiTags)('entrepreneur-campaigns'),
    (0, common_1.Get)('me/campaigns/:campaignId'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener detalle de una campaña propia' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('campaignId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], EntrepreneurController.prototype, "getMyCampaignById", null);
__decorate([
    (0, swagger_1.ApiTags)('entrepreneur-finances'),
    (0, common_1.Get)('me/finances/summary'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener resumen financiero global' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], EntrepreneurController.prototype, "getMyFinancialSummary", null);
__decorate([
    (0, swagger_1.ApiTags)('entrepreneur-finances'),
    (0, common_1.Get)('me/campaigns/:campaignId/financial-progress'),
    (0, swagger_1.ApiOperation)({ summary: 'Progreso financiero de una campaña (EDT 1.4)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Progreso financiero retornado.' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('campaignId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], EntrepreneurController.prototype, "getCampaignFinancialProgress", null);
exports.EntrepreneurController = EntrepreneurController = __decorate([
    (0, swagger_1.ApiTags)('entrepreneur-profile'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Controller)('entrepreneurs'),
    __metadata("design:paramtypes", [services_1.EntrepreneurService])
], EntrepreneurController);
//# sourceMappingURL=entrepreneur.controller.js.map