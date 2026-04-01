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
exports.EntrepreneurCampaignsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const services_1 = require("../services");
const dto_1 = require("../dto");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
let EntrepreneurCampaignsController = class EntrepreneurCampaignsController {
    constructor(campaignService) {
        this.campaignService = campaignService;
    }
    async createCampaign(req, dto) {
        const userId = req.user.sub || req.user.id;
        const campaign = await this.campaignService.createCampaign(userId, dto);
        return {
            statusCode: 201,
            message: 'Campaign created successfully',
            data: campaign,
            timestamp: new Date().toISOString(),
        };
    }
    async getMyCampaigns(req, query) {
        const userId = req.user.sub || req.user.id;
        const result = await this.campaignService.getMyCampaigns(userId, query);
        return {
            statusCode: 200,
            message: 'Campaigns retrieved successfully',
            data: result,
            timestamp: new Date().toISOString(),
        };
    }
};
exports.EntrepreneurCampaignsController = EntrepreneurCampaignsController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new campaign as draft' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, dto_1.CreateCampaignDto]),
    __metadata("design:returntype", Promise)
], EntrepreneurCampaignsController.prototype, "createCampaign", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get my campaigns with pagination' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'sortBy', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'sortOrder', required: false }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, dto_1.QueryCampaignsDto]),
    __metadata("design:returntype", Promise)
], EntrepreneurCampaignsController.prototype, "getMyCampaigns", null);
exports.EntrepreneurCampaignsController = EntrepreneurCampaignsController = __decorate([
    (0, swagger_1.ApiTags)('Entrepreneur Campaigns'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('entrepreneurs/me/campaigns'),
    __metadata("design:paramtypes", [services_1.CampaignService])
], EntrepreneurCampaignsController);
//# sourceMappingURL=entrepreneur-campaign.controller.js.map