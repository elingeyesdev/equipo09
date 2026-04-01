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
exports.QueryCampaignsDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const dto_1 = require("../../../common/dto");
class QueryCampaignsDto extends dto_1.PaginationDto {
    constructor() {
        super(...arguments);
        this.sortBy = 'created_at';
        this.sortOrder = 'DESC';
    }
}
exports.QueryCampaignsDto = QueryCampaignsDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        enum: [
            'draft', 'pending_review', 'in_review', 'approved', 'rejected',
            'published', 'funded', 'partially_funded', 'failed',
            'cancelled', 'completed', 'suspended',
        ],
        description: 'Filtrar por estado de campaña',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsIn)([
        'draft', 'pending_review', 'in_review', 'approved', 'rejected',
        'published', 'funded', 'partially_funded', 'failed',
        'cancelled', 'completed', 'suspended',
    ]),
    __metadata("design:type", String)
], QueryCampaignsDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        enum: ['donation', 'reward', 'equity'],
        description: 'Filtrar por tipo de campaña',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsIn)(['donation', 'reward', 'equity']),
    __metadata("design:type", String)
], QueryCampaignsDto.prototype, "campaignType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        enum: ['created_at', 'current_amount', 'goal_amount', 'end_date', 'title'],
        default: 'created_at',
        description: 'Campo de ordenamiento',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsIn)(['created_at', 'current_amount', 'goal_amount', 'end_date', 'title']),
    __metadata("design:type", String)
], QueryCampaignsDto.prototype, "sortBy", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        enum: ['ASC', 'DESC'],
        default: 'DESC',
        description: 'Dirección de ordenamiento',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsIn)(['ASC', 'DESC']),
    __metadata("design:type", String)
], QueryCampaignsDto.prototype, "sortOrder", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Buscar por título (parcial)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryCampaignsDto.prototype, "search", void 0);
//# sourceMappingURL=query-campaigns.dto.js.map