import { Request } from 'express';
import { AuthService, LoginResponse } from '../services';
import { LoginDto } from '../dto';
import { ApiSuccessResponse } from '../../../common/dto';
import { User } from '../../users/models';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(dto: LoginDto, req: Request): Promise<ApiSuccessResponse<LoginResponse>>;
    me(req: Request): Promise<ApiSuccessResponse<User>>;
    seed(): Promise<ApiSuccessResponse<{
        message: string;
        email: string;
        password: string;
    }>>;
}
