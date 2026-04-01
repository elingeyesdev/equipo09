"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryRepository = void 0;
const common_1 = require("@nestjs/common");
const database_1 = require("../../../common/database");
const models_1 = require("../models");
let CategoryRepository = class CategoryRepository extends database_1.BaseRepository {
    async findAllActive() {
        const rows = await this.queryMany(`SELECT * FROM categories
       WHERE is_active = true
       ORDER BY sort_order ASC`, []);
        return rows.map(models_1.mapRowToCategory);
    }
    async findByIds(ids) {
        if (ids.length === 0)
            return [];
        const placeholders = ids.map((_, i) => `$${i + 1}`).join(', ');
        const rows = await this.queryMany(`SELECT * FROM categories
       WHERE id IN (${placeholders}) AND is_active = true
       ORDER BY sort_order ASC`, ids);
        return rows.map(models_1.mapRowToCategory);
    }
};
exports.CategoryRepository = CategoryRepository;
exports.CategoryRepository = CategoryRepository = __decorate([
    (0, common_1.Injectable)()
], CategoryRepository);
//# sourceMappingURL=category.repository.js.map