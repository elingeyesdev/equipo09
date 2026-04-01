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
var UserService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const common_1 = require("@nestjs/common");
const exceptions_1 = require("../../../common/exceptions");
const repositories_1 = require("../repositories");
let UserService = UserService_1 = class UserService {
    constructor(userRepo) {
        this.userRepo = userRepo;
        this.logger = new common_1.Logger(UserService_1.name);
    }
    async register(dto) {
        this.logger.log(`Registrando usuario: ${dto.email}`);
        const exists = await this.userRepo.existsByEmail(dto.email);
        if (exists) {
            throw new exceptions_1.ConflictException(`El email '${dto.email}' ya está registrado`);
        }
        const user = await this.userRepo.create(dto);
        this.logger.log(`Usuario creado: ${user.id}`);
        return user;
    }
    async findById(id) {
        const user = await this.userRepo.findByIdWithRoles(id);
        if (!user) {
            throw new exceptions_1.NotFoundException('Usuario', id);
        }
        return user;
    }
    async getMe(userId) {
        return this.findById(userId);
    }
};
exports.UserService = UserService;
exports.UserService = UserService = UserService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [repositories_1.UserRepository])
], UserService);
//# sourceMappingURL=user.service.js.map