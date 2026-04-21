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
exports.AdminController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const admin_service_1 = require("../services/admin.service");
const guards_1 = require("../../auth/guards");
const roles_guard_1 = require("../../auth/guards/roles.guard");
const roles_decorator_1 = require("../../auth/decorators/roles.decorator");
const dto_1 = require("../../../common/dto");
const admin_campaigns_dto_1 = require("../dto/admin-campaigns.dto");
let AdminController = class AdminController {
    constructor(adminService) {
        this.adminService = adminService;
    }
    async getDashboardStats() {
        const stats = await this.adminService.getDashboardStats();
        return new dto_1.ApiSuccessResponse(stats, 'Estadísticas obtenidas');
    }
    async getAllUsers() {
        const users = await this.adminService.getAllUsers();
        return new dto_1.ApiSuccessResponse(users, 'Usuarios listados');
    }
    async getAllCampaigns() {
        const campaigns = await this.adminService.getAllCampaigns();
        return new dto_1.ApiSuccessResponse(campaigns, 'Campañas listadas');
    }
    async getPendingCampaigns(query) {
        const result = await this.adminService.getPendingCampaigns(query);
        return new dto_1.ApiSuccessResponse(result, 'Listado de campañas obtenido con éxito');
    }
    async getCampaignDetail(id) {
        const campaign = await this.adminService.getCampaignDetail(id);
        return new dto_1.ApiSuccessResponse(campaign, 'Detalle de campaña obtenido');
    }
    async getCampaignHistory(id) {
        const history = await this.adminService.getCampaignHistory(id);
        return new dto_1.ApiSuccessResponse(history, 'Historial de campaña obtenido');
    }
    async updateCampaignStatus(id, status, feedback, req) {
        const reviewerId = req.user.id;
        const updated = await this.adminService.updateCampaignStatus(id, status, reviewerId, feedback);
        return new dto_1.ApiSuccessResponse(updated, 'Estado de campaña actualizado con éxito');
    }
    async softDeleteUser(id) {
        const deleted = await this.adminService.softDeleteUser(id);
        return new dto_1.ApiSuccessResponse(deleted, 'Usuario inhabilitado con éxito');
    }
    async deleteCampaign(id, req) {
        const reviewerId = req.user.id;
        const deleted = await this.adminService.hardDeleteCampaign(id, reviewerId);
        return new dto_1.ApiSuccessResponse(deleted, 'Campaña eliminada o cancelada con éxito');
    }
};
exports.AdminController = AdminController;
__decorate([
    (0, common_1.Get)('dashboard-stats'),
    (0, roles_decorator_1.Roles)('admin', 'super_admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener estadísticas del dashboard' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getDashboardStats", null);
__decorate([
    (0, common_1.Get)('users'),
    (0, roles_decorator_1.Roles)('admin', 'super_admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Listar usuarios registrados' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getAllUsers", null);
__decorate([
    (0, common_1.Get)('campaigns'),
    (0, roles_decorator_1.Roles)('admin', 'super_admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Listar todas las campañas para revisión (Legado)' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getAllCampaigns", null);
__decorate([
    (0, common_1.Get)('campaigns/pending'),
    (0, roles_decorator_1.Roles)('admin', 'super_admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Listar campañas pendientes con filtros y paginación' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [admin_campaigns_dto_1.QueryAdminCampaignsDto]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getPendingCampaigns", null);
__decorate([
    (0, common_1.Get)('campaigns/:id'),
    (0, roles_decorator_1.Roles)('admin', 'super_admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener detalle completo de una campaña para revisión' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getCampaignDetail", null);
__decorate([
    (0, common_1.Get)('campaigns/:id/history'),
    (0, roles_decorator_1.Roles)('admin', 'super_admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener historial de cambios de una campaña' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getCampaignHistory", null);
__decorate([
    (0, common_1.Patch)('campaigns/:id/status'),
    (0, roles_decorator_1.Roles)('admin', 'super_admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Aprobar o rechazar campañas con feedback' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('status')),
    __param(2, (0, common_1.Body)('feedback')),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "updateCampaignStatus", null);
__decorate([
    (0, common_1.Delete)('users/:id'),
    (0, roles_decorator_1.Roles)('admin', 'super_admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Desactiva un usuario lógicamente' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "softDeleteUser", null);
__decorate([
    (0, common_1.Delete)('campaigns/:id'),
    (0, roles_decorator_1.Roles)('admin', 'super_admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Borra físicamente una campaña, si aplica' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "deleteCampaign", null);
exports.AdminController = AdminController = __decorate([
    (0, swagger_1.ApiTags)('admin'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(guards_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)('admin'),
    __metadata("design:paramtypes", [admin_service_1.AdminService])
], AdminController);
//# sourceMappingURL=admin.controller.js.map