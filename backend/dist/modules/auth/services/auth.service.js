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
var AuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = require("bcrypt");
const repositories_1 = require("../../users/repositories");
const exceptions_1 = require("../../../common/exceptions");
let AuthService = AuthService_1 = class AuthService {
    constructor(userRepo, jwtService) {
        this.userRepo = userRepo;
        this.jwtService = jwtService;
        this.logger = new common_1.Logger(AuthService_1.name);
    }
    async login(dto, ip) {
        this.logger.log(`Intento de login: ${dto.email}`);
        const result = await this.userRepo.findByEmailWithPassword(dto.email);
        if (!result) {
            throw new exceptions_1.UnauthorizedException('Credenciales inválidas');
        }
        const { user, passwordHash } = result;
        const isPasswordValid = await bcrypt.compare(dto.password, passwordHash);
        if (!isPasswordValid) {
            await this.userRepo.incrementFailedAttempts(user.id);
            throw new exceptions_1.UnauthorizedException('Credenciales inválidas');
        }
        await this.userRepo.updateLastLogin(user.id, ip);
        let fullUser = await this.userRepo.findByIdWithRoles(user.id);
        if (!fullUser) {
            throw new exceptions_1.UnauthorizedException('Credenciales inválidas');
        }
        if (!fullUser.roles?.length) {
            if (await this.userRepo.hasEntrepreneurProfile(user.id)) {
                await this.userRepo.assignRoleByName(user.id, 'entrepreneur');
                fullUser = (await this.userRepo.findByIdWithRoles(user.id));
                this.logger.log(`Rol entrepreneur restaurado desde perfil: ${user.id}`);
            }
            else if (await this.userRepo.hasInvestorProfile(user.id)) {
                await this.userRepo.assignRoleByName(user.id, 'investor');
                fullUser = (await this.userRepo.findByIdWithRoles(user.id));
                this.logger.log(`Rol investor restaurado desde perfil: ${user.id}`);
            }
        }
        const payload = { sub: fullUser.id, email: fullUser.email };
        const accessToken = this.jwtService.sign(payload);
        this.logger.log(`Login exitoso: ${fullUser.id}`);
        return {
            accessToken,
            tokenType: 'Bearer',
            expiresIn: process.env.JWT_EXPIRES_IN ?? '24h',
            user: fullUser,
        };
    }
    async validateToken(userId) {
        const user = await this.userRepo.findByIdWithRoles(userId);
        if (!user || !user.isActive) {
            throw new exceptions_1.UnauthorizedException('Token inválido o usuario inactivo');
        }
        return user;
    }
    async seedSuperAdmin() {
        const passwordHash = await bcrypt.hash('Superadmin123', 12);
        await this.userRepo.seedSuperAdmin(passwordHash);
        return { message: 'SuperAdmin actualizado forzosamente', email: 'superadmin@equipo09.com', password: 'Superadmin123' };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [repositories_1.UserRepository,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map