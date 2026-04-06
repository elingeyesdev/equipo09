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
exports.CreateUserDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class CreateUserDto {
}
exports.CreateUserDto = CreateUserDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'usuario@gmail.com',
        description: 'Correo electrónico único del usuario',
    }),
    (0, class_validator_1.IsEmail)({}, { message: 'El email no tiene formato válido' }),
    (0, class_validator_1.MaxLength)(255),
    __metadata("design:type", String)
], CreateUserDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Password123!',
        description: 'Contraseña (mínimo 8 caracteres, al menos una mayúscula y un número)',
        minLength: 8,
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(8, { message: 'La contraseña debe tener al menos 8 caracteres' }),
    (0, class_validator_1.MaxLength)(128),
    (0, class_validator_1.Matches)(/^(?=.*[A-Z])(?=.*\d).+$/, {
        message: 'La contraseña debe tener al menos una mayúscula y un número',
    }),
    __metadata("design:type", String)
], CreateUserDto.prototype, "password", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: '+573001234567',
        description: 'Teléfono (opcional)',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(20),
    __metadata("design:type", String)
], CreateUserDto.prototype, "phone", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 'es',
        enum: ['es', 'en'],
        description: 'Idioma preferido',
        default: 'es',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['es', 'en']),
    __metadata("design:type", String)
], CreateUserDto.prototype, "preferredLanguage", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        enum: ['investor', 'entrepreneur'],
        description: 'Rol principal al registrarse (se guarda en user_roles)',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['investor', 'entrepreneur']),
    __metadata("design:type", String)
], CreateUserDto.prototype, "signupRole", void 0);
//# sourceMappingURL=create-user.dto.js.map