"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminModule = void 0;
const common_1 = require("@nestjs/common");
const admin_controller_1 = require("./controllers/admin.controller");
const superadmin_controller_1 = require("./controllers/superadmin.controller");
const admin_service_1 = require("./services/admin.service");
const admin_repository_1 = require("./repositories/admin.repository");
const user_module_1 = require("../users/user.module");
const entrepreneur_module_1 = require("../entrepreneur/entrepreneur.module");
const reward_tiers_module_1 = require("../reward-tiers/reward-tiers.module");
let AdminModule = class AdminModule {
};
exports.AdminModule = AdminModule;
exports.AdminModule = AdminModule = __decorate([
    (0, common_1.Module)({
        imports: [user_module_1.UsersModule, entrepreneur_module_1.EntrepreneurModule, reward_tiers_module_1.RewardTiersModule],
        controllers: [admin_controller_1.AdminController, superadmin_controller_1.SuperAdminController],
        providers: [admin_service_1.AdminService, admin_repository_1.AdminRepository],
    })
], AdminModule);
//# sourceMappingURL=admin.module.js.map