"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnauthorizedException = exports.BadRequestException = exports.ForbiddenException = exports.ConflictException = exports.NotFoundException = void 0;
const common_1 = require("@nestjs/common");
class NotFoundException extends common_1.HttpException {
    constructor(resource, identifier) {
        const message = identifier
            ? `${resource} con id '${identifier}' no encontrado`
            : `${resource} no encontrado`;
        super({
            statusCode: common_1.HttpStatus.NOT_FOUND,
            error: 'Not Found',
            message,
        }, common_1.HttpStatus.NOT_FOUND);
    }
}
exports.NotFoundException = NotFoundException;
class ConflictException extends common_1.HttpException {
    constructor(message) {
        super({
            statusCode: common_1.HttpStatus.CONFLICT,
            error: 'Conflict',
            message,
        }, common_1.HttpStatus.CONFLICT);
    }
}
exports.ConflictException = ConflictException;
class ForbiddenException extends common_1.HttpException {
    constructor(message = 'No tienes permiso para realizar esta acción') {
        super({
            statusCode: common_1.HttpStatus.FORBIDDEN,
            error: 'Forbidden',
            message,
        }, common_1.HttpStatus.FORBIDDEN);
    }
}
exports.ForbiddenException = ForbiddenException;
class BadRequestException extends common_1.HttpException {
    constructor(message) {
        super({
            statusCode: common_1.HttpStatus.BAD_REQUEST,
            error: 'Bad Request',
            message,
        }, common_1.HttpStatus.BAD_REQUEST);
    }
}
exports.BadRequestException = BadRequestException;
class UnauthorizedException extends common_1.HttpException {
    constructor(message = 'No autenticado o token inválido') {
        super({
            statusCode: common_1.HttpStatus.UNAUTHORIZED,
            error: 'Unauthorized',
            message,
        }, common_1.HttpStatus.UNAUTHORIZED);
    }
}
exports.UnauthorizedException = UnauthorizedException;
//# sourceMappingURL=http-exceptions.js.map