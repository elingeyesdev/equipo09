"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const database_module_1 = require("./config/database.module");
const user_module_1 = require("./modules/users/user.module");
const auth_module_1 = require("./modules/auth/auth.module");
const entrepreneur_module_1 = require("./modules/entrepreneur/entrepreneur.module");
const investor_module_1 = require("./modules/investor/investor.module");
const categories_module_1 = require("./modules/categories/categories.module");
const campaign_module_1 = require("./modules/campaigns/campaign.module");
const admin_module_1 = require("./modules/admin/admin.module");
const investments_module_1 = require("./modules/investments/investments.module");
const serve_static_1 = require("@nestjs/serve-static");
const path_1 = require("path");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: '.env',
            }),
            database_module_1.DatabaseModule,
            user_module_1.UsersModule,
            auth_module_1.AuthModule,
            entrepreneur_module_1.EntrepreneurModule,
            investor_module_1.InvestorModule,
            categories_module_1.CategoriesModule,
            campaign_module_1.CampaignsModule,
            admin_module_1.AdminModule,
            investments_module_1.InvestmentsModule,
            serve_static_1.ServeStaticModule.forRoot({
                rootPath: (0, path_1.join)(__dirname, '..', 'uploads'),
                serveRoot: '/uploads',
            }),
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map