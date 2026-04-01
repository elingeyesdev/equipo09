import { HttpException } from '@nestjs/common';
export declare class NotFoundException extends HttpException {
    constructor(resource: string, identifier?: string);
}
export declare class ConflictException extends HttpException {
    constructor(message: string);
}
export declare class ForbiddenException extends HttpException {
    constructor(message?: string);
}
export declare class BadRequestException extends HttpException {
    constructor(message: string);
}
export declare class UnauthorizedException extends HttpException {
    constructor(message?: string);
}
