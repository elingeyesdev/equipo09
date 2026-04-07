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
var InvestorService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvestorService = void 0;
const common_1 = require("@nestjs/common");
const exceptions_1 = require("../../../common/exceptions");
const repositories_1 = require("../repositories");
const repositories_2 = require("../../users/repositories");
let InvestorService = InvestorService_1 = class InvestorService {
    constructor(profileRepo, userRepo) {
        this.profileRepo = profileRepo;
        this.userRepo = userRepo;
        this.logger = new common_1.Logger(InvestorService_1.name);
    }
    async createProfile(userId, dto) {
        this.logger.log(`Creando perfil de inversor para user ${userId}`);
        const exists = await this.profileRepo.existsByUserId(userId);
        if (exists) {
            throw new exceptions_1.ConflictException('Este usuario ya tiene un perfil de inversor');
        }
        const profile = await this.profileRepo.create(userId, dto);
        this.logger.log(`Perfil de inversor creado: ${profile.id} para user ${userId}`);
        return profile;
    }
    async getMyProfile(userId) {
        const profile = await this.profileRepo.findByUserId(userId);
        if (!profile) {
            throw new exceptions_1.NotFoundException('Perfil de inversor');
        }
        return profile;
    }
    async getProfileById(profileId) {
        const profile = await this.profileRepo.findById(profileId);
        if (!profile) {
            throw new exceptions_1.NotFoundException('Perfil de inversor', profileId);
        }
        return profile;
    }
    async getCapitalOverview(userId) {
        const overview = await this.profileRepo.getCapitalOverview(userId);
        if (!overview) {
            throw new exceptions_1.NotFoundException('Perfil de inversor no encontrado');
        }
        return overview;
    }
    async updateMyProfile(userId, dto) {
        this.logger.log(`Actualizando perfil de inversor para user ${userId}`);
        const exists = await this.profileRepo.existsByUserId(userId);
        if (!exists) {
            throw new exceptions_1.NotFoundException('Perfil de inversor');
        }
        const updated = await this.profileRepo.update(userId, dto);
        if (!updated) {
            throw new exceptions_1.NotFoundException('Perfil de inversor');
        }
        this.logger.log(`Perfil de inversor actualizado: ${updated.id}`);
        return updated;
    }
    async deleteMyProfile(userId) {
        const n = await this.profileRepo.countInvestmentsByInvestor(userId);
        if (n > 0) {
            throw new exceptions_1.BadRequestException(`No puedes eliminar tu perfil de inversor mientras tengas ${n} inversión(es) registrada(s).`);
        }
        const existed = await this.profileRepo.existsByUserId(userId);
        if (!existed) {
            throw new exceptions_1.NotFoundException('Perfil de inversor');
        }
        await this.profileRepo.deleteByUserId(userId);
        try {
            await this.userRepo.removeRoleByName(userId, 'investor');
        }
        catch (err) {
            this.logger.warn(`No se pudo quitar rol investor: ${err}`);
        }
        this.logger.log(`Perfil de inversor eliminado para user ${userId}`);
    }
};
exports.InvestorService = InvestorService;
exports.InvestorService = InvestorService = InvestorService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [repositories_1.InvestorProfileRepository,
        repositories_2.UserRepository])
], InvestorService);
//# sourceMappingURL=investor.service.js.map