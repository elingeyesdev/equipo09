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
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const path_1 = require("path");
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
    async getCampaignReadiness(req) {
        const userId = req.user.id;
        const readiness = await this.entrepreneurService.getCampaignCreationReadiness(userId);
        return new dto_2.ApiSuccessResponse(readiness);
    }
    async updateMyProfile(req, dto) {
        const userId = req.user.id;
        const profile = await this.entrepreneurService.updateMyProfile(userId, dto);
        return new dto_2.ApiSuccessResponse(profile, 'Perfil actualizado exitosamente');
    }
    async deleteMyProfile(req) {
        const userId = req.user.id;
        await this.entrepreneurService.deleteMyProfile(userId);
        return new dto_2.ApiSuccessResponse(null, 'Perfil de emprendedor eliminado');
    }
    async getProfileById(id) {
        const profile = await this.entrepreneurService.getProfileById(id);
        return new dto_2.ApiSuccessResponse(profile);
    }
    async uploadAvatar(req, file) {
        const userId = req.user.id;
        const url = `/uploads/profiles/${file.filename}`;
        const profile = await this.entrepreneurService.updateMyProfile(userId, {
            avatarUrl: url,
        });
        return new dto_2.ApiSuccessResponse(profile, 'Avatar actualizado');
    }
    async uploadCover(req, file) {
        const userId = req.user.id;
        const url = `/uploads/profiles/${file.filename}`;
        const profile = await this.entrepreneurService.updateMyProfile(userId, {
            coverUrl: url,
        });
        return new dto_2.ApiSuccessResponse(profile, 'Portada actualizada');
    }
    async createCampaign(req, dto) {
        const userId = req.user.id;
        const campaign = await this.entrepreneurService.createCampaign(userId, dto);
        return new dto_2.ApiSuccessResponse(campaign, 'Campaña creada exitosamente');
    }
    async updateCampaign(req, campaignId, dto) {
        const userId = req.user.id;
        const campaign = await this.entrepreneurService.updateCampaign(userId, campaignId, dto);
        return new dto_2.ApiSuccessResponse(campaign, 'Campaña actualizada con éxito');
    }
    async getMyCampaigns(req, query) {
        const userId = req.user.id;
        const result = await this.entrepreneurService.getMyCampaigns(userId, query);
        return new dto_2.ApiSuccessResponse(result);
    }
    async submitCampaignForReview(req, campaignId) {
        const userId = req.user.id;
        const campaign = await this.entrepreneurService.submitCampaignForReview(userId, campaignId);
        return new dto_2.ApiSuccessResponse(campaign, 'Campaña enviada a revisión');
    }
    async getCampaignHistory(req, campaignId) {
        const userId = req.user.id;
        const history = await this.entrepreneurService.getCampaignHistory(userId, campaignId);
        return new dto_2.ApiSuccessResponse(history, 'Historial de campaña obtenido');
    }
    async publishCampaign(req, campaignId) {
        const userId = req.user.id;
        const campaign = await this.entrepreneurService.publishCampaign(userId, campaignId);
        return new dto_2.ApiSuccessResponse(campaign, 'Campaña publicada');
    }
    async uploadCampaignCover(req, campaignId, file) {
        const userId = req.user.id;
        const url = `/uploads/campaigns/${file.filename}`;
        const campaign = await this.entrepreneurService.updateCampaignCover(userId, campaignId, url);
        return new dto_2.ApiSuccessResponse(campaign, 'Portada de campaña actualizada');
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
    async getCampaignInvestors(req, campaignId, page, limit) {
        const userId = req.user.id;
        const result = await this.entrepreneurService.getCampaignInvestors(userId, campaignId, { page: page ? Number(page) : 1, limit: limit ? Number(limit) : 20 });
        return new dto_2.ApiSuccessResponse(result);
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
    (0, common_1.Get)('me/profile/campaign-readiness'),
    (0, swagger_1.ApiOperation)({
        summary: 'Comprobar si el perfil permite crear campañas',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Estado de requisitos para nuevas campañas.' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], EntrepreneurController.prototype, "getCampaignReadiness", null);
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
    (0, common_1.Delete)('me/profile'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Eliminar mi perfil de emprendedor' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Perfil eliminado.' }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'No se puede eliminar si hay campañas asociadas.',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Sin perfil de emprendedor.' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], EntrepreneurController.prototype, "deleteMyProfile", null);
__decorate([
    (0, common_1.Get)(':id/profile'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener perfil público de un emprendedor' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EntrepreneurController.prototype, "getProfileById", null);
__decorate([
    (0, common_1.Post)('me/profile/avatar'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        storage: (0, multer_1.diskStorage)({
            destination: './uploads/profiles',
            filename: (req, file, cb) => {
                const randomName = Array(32)
                    .fill(null)
                    .map(() => Math.round(Math.random() * 16).toString(16))
                    .join('');
                return cb(null, `${randomName}${(0, path_1.extname)(file.originalname)}`);
            },
        }),
    })),
    (0, swagger_1.ApiOperation)({ summary: 'Subir avatar del emprendedor' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], EntrepreneurController.prototype, "uploadAvatar", null);
__decorate([
    (0, common_1.Post)('me/profile/cover'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        storage: (0, multer_1.diskStorage)({
            destination: './uploads/profiles',
            filename: (req, file, cb) => {
                const randomName = Array(32)
                    .fill(null)
                    .map(() => Math.round(Math.random() * 16).toString(16))
                    .join('');
                return cb(null, `${randomName}${(0, path_1.extname)(file.originalname)}`);
            },
        }),
    })),
    (0, swagger_1.ApiOperation)({ summary: 'Subir portada del emprendedor' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], EntrepreneurController.prototype, "uploadCover", null);
__decorate([
    (0, swagger_1.ApiTags)('entrepreneur-campaigns'),
    (0, common_1.Post)('me/campaigns'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Crear nueva campaña (EDT 1.3)' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Campaña creada exitosamente.' }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Perfil incompleto u otros datos inválidos.',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Sin perfil de emprendedor.' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, dto_1.CreateCampaignDto]),
    __metadata("design:returntype", Promise)
], EntrepreneurController.prototype, "createCampaign", null);
__decorate([
    (0, swagger_1.ApiTags)('entrepreneur-campaigns'),
    (0, common_1.Patch)('me/campaigns/:campaignId'),
    (0, swagger_1.ApiOperation)({ summary: 'Actualizar datos de una campaña (Borrador o Rechazada)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Campaña actualizada.' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('campaignId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], EntrepreneurController.prototype, "updateCampaign", null);
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
    (0, common_1.Post)('me/campaigns/:campaignId/submit-for-review'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Enviar campaña en borrador a revisión' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Estado actualizado.' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Transición no permitida.' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('campaignId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], EntrepreneurController.prototype, "submitCampaignForReview", null);
__decorate([
    (0, swagger_1.ApiTags)('entrepreneur-campaigns'),
    (0, common_1.Get)('me/campaigns/:campaignId/history'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener historial de auditoría de una campaña propia' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Historial de estados y feedback.' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('campaignId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], EntrepreneurController.prototype, "getCampaignHistory", null);
__decorate([
    (0, swagger_1.ApiTags)('entrepreneur-campaigns'),
    (0, common_1.Post)('me/campaigns/:campaignId/publish'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Publicar campaña (borrador o aprobada)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Campaña publicada.' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Transición no permitida.' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('campaignId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], EntrepreneurController.prototype, "publishCampaign", null);
__decorate([
    (0, swagger_1.ApiTags)('entrepreneur-campaigns'),
    (0, common_1.Post)('me/campaigns/:campaignId/cover'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        storage: (0, multer_1.diskStorage)({
            destination: './uploads/campaigns',
            filename: (req, file, cb) => {
                const randomName = Array(32)
                    .fill(null)
                    .map(() => Math.round(Math.random() * 16).toString(16))
                    .join('');
                return cb(null, `${randomName}${(0, path_1.extname)(file.originalname)}`);
            },
        }),
    })),
    (0, swagger_1.ApiOperation)({ summary: 'Subir portada de una campaña' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('campaignId')),
    __param(2, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], EntrepreneurController.prototype, "uploadCampaignCover", null);
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
__decorate([
    (0, swagger_1.ApiTags)('entrepreneur-campaigns'),
    (0, common_1.Get)('me/campaigns/:campaignId/investors'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener lista de inversores de una campaña propia' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Lista de inversores retornada.' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('campaignId')),
    __param(2, (0, common_1.Query)('page')),
    __param(3, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Number, Number]),
    __metadata("design:returntype", Promise)
], EntrepreneurController.prototype, "getCampaignInvestors", null);
exports.EntrepreneurController = EntrepreneurController = __decorate([
    (0, swagger_1.ApiTags)('entrepreneur-profile'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Controller)('entrepreneurs'),
    __metadata("design:paramtypes", [services_1.EntrepreneurService])
], EntrepreneurController);
//# sourceMappingURL=entrepreneur.controller.js.map