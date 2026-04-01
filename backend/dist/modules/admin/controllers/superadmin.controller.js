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
exports.SuperAdminController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const admin_service_1 = require("../services/admin.service");
const guards_1 = require("../../auth/guards");
const roles_guard_1 = require("../../auth/guards/roles.guard");
const roles_decorator_1 = require("../../auth/decorators/roles.decorator");
const dto_1 = require("../../../common/dto");
const create_admin_dto_1 = require("../dto/create-admin.dto");
let SuperAdminController = class SuperAdminController {
    constructor(adminService) {
        this.adminService = adminService;
    }
    async createAdmin(dto) {
        const result = await this.adminService.createAdmin(dto.email, dto.password);
        return new dto_1.ApiSuccessResponse(result, 'Administrador creado con éxito');
    }
    async getAllAdmins() {
        const admins = await this.adminService.getAllAdmins();
        return new dto_1.ApiSuccessResponse(admins, 'Administradores listados');
    }
    async deleteAdmin(id) {
        const result = await this.adminService.deleteAdminProfile(id);
        return new dto_1.ApiSuccessResponse(result, 'Privilegios de administrador eliminados');
    }
};
exports.SuperAdminController = SuperAdminController;
__decorate([
    (0, common_1.Post)('admins'),
    (0, swagger_1.ApiOperation)({ summary: 'Crear un nuevo usuario Administrador' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_admin_dto_1.CreateAdminDto]),
    __metadata("design:returntype", Promise)
], SuperAdminController.prototype, "createAdmin", null);
__decorate([
    (0, common_1.Get)('admins'),
    (0, swagger_1.ApiOperation)({ summary: 'Listar usuarios administradores' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SuperAdminController.prototype, "getAllAdmins", null);
__decorate([
    (0, common_1.Delete)('admins/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Borrar/Revocar permisos de un usuario Administrador' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SuperAdminController.prototype, "deleteAdmin", null);
exports.SuperAdminController = SuperAdminController = __decorate([
    (0, swagger_1.ApiTags)('superadmin'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(guards_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('super_admin'),
    (0, common_1.Controller)('superadmin'),
    __metadata("design:paramtypes", [admin_service_1.AdminService])
], SuperAdminController);
//# sourceMappingURL=superadmin.controller.js.map