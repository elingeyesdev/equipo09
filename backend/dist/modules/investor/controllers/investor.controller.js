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
exports.InvestorController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const path_1 = require("path");
const swagger_1 = require("@nestjs/swagger");
const passport_1 = require("@nestjs/passport");
const services_1 = require("../services");
const dto_1 = require("../dto");
const dto_2 = require("../../../common/dto");
let InvestorController = class InvestorController {
    constructor(investorService) {
        this.investorService = investorService;
    }
    async createProfile(req, dto) {
        const userId = req.user.id;
        const profile = await this.investorService.createProfile(userId, dto);
        return new dto_2.ApiSuccessResponse(profile, 'Perfil de inversor creado exitosamente');
    }
    async getMyProfile(req) {
        const userId = req.user.id;
        const profile = await this.investorService.getMyProfile(userId);
        return new dto_2.ApiSuccessResponse(profile);
    }
    async getCapitalOverview(req) {
        const userId = req.user.id;
        const overview = await this.investorService.getCapitalOverview(userId);
        return new dto_2.ApiSuccessResponse(overview);
    }
    async updateMyProfile(req, dto) {
        const userId = req.user.id;
        const profile = await this.investorService.updateMyProfile(userId, dto);
        return new dto_2.ApiSuccessResponse(profile, 'Perfil actualizado exitosamente');
    }
    async deleteMyProfile(req) {
        const userId = req.user.id;
        await this.investorService.deleteMyProfile(userId);
        return new dto_2.ApiSuccessResponse(null, 'Perfil de inversor eliminado');
    }
    async getProfileById(id) {
        const profile = await this.investorService.getProfileById(id);
        return new dto_2.ApiSuccessResponse(profile);
    }
    async uploadAvatar(req, file) {
        const userId = req.user.id;
        const url = `/uploads/profiles/${file.filename}`;
        const profile = await this.investorService.updateMyProfile(userId, {
            avatarUrl: url,
        });
        return new dto_2.ApiSuccessResponse(profile, 'Avatar actualizado');
    }
    async uploadCover(req, file) {
        const userId = req.user.id;
        const url = `/uploads/profiles/${file.filename}`;
        const profile = await this.investorService.updateMyProfile(userId, {
            coverUrl: url,
        });
        return new dto_2.ApiSuccessResponse(profile, 'Portada actualizada');
    }
};
exports.InvestorController = InvestorController;
__decorate([
    (0, common_1.Post)('me/profile'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Crear perfil de inversor' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Perfil creado exitosamente.' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'El usuario ya tiene un perfil de inversor.' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'No autenticado.' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, dto_1.CreateInvestorProfileDto]),
    __metadata("design:returntype", Promise)
], InvestorController.prototype, "createProfile", null);
__decorate([
    (0, common_1.Get)('me/profile'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener mi perfil de inversor' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Perfil retornado exitosamente.' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Perfil no encontrado.' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], InvestorController.prototype, "getMyProfile", null);
__decorate([
    (0, common_1.Get)('me/capital'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener resumen de capital del inversor' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Resumen retornado exitosamente.' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Perfil no encontrado.' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], InvestorController.prototype, "getCapitalOverview", null);
__decorate([
    (0, common_1.Put)('me/profile'),
    (0, swagger_1.ApiOperation)({ summary: 'Editar datos personales del inversor' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Perfil actualizado exitosamente.' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Perfil no encontrado.' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'No autenticado.' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, dto_1.UpdateInvestorProfileDto]),
    __metadata("design:returntype", Promise)
], InvestorController.prototype, "updateMyProfile", null);
__decorate([
    (0, common_1.Delete)('me/profile'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Eliminar mi perfil de inversor' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Perfil eliminado.' }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'No se puede eliminar si hay inversiones registradas.',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Sin perfil de inversor.' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], InvestorController.prototype, "deleteMyProfile", null);
__decorate([
    (0, common_1.Get)(':id/profile'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener perfil público de un inversor' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Perfil retornado exitosamente.' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Perfil no encontrado.' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], InvestorController.prototype, "getProfileById", null);
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
    (0, swagger_1.ApiOperation)({ summary: 'Subir avatar del inversor' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], InvestorController.prototype, "uploadAvatar", null);
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
    (0, swagger_1.ApiOperation)({ summary: 'Subir portada del inversor' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], InvestorController.prototype, "uploadCover", null);
exports.InvestorController = InvestorController = __decorate([
    (0, swagger_1.ApiTags)('investor-profile'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Controller)('investors'),
    __metadata("design:paramtypes", [services_1.InvestorService])
], InvestorController);
//# sourceMappingURL=investor.controller.js.map