import { Request } from 'express';
import { UserService } from '../services';
import { CreateUserDto } from '../dto';
import { ApiSuccessResponse } from '../../../common/dto';
import { User } from '../models';
export declare class UserController {
    private readonly userService;
    constructor(userService: UserService);
    register(dto: CreateUserDto): Promise<ApiSuccessResponse<User>>;
    getMe(req: Request): Promise<ApiSuccessResponse<User>>;
    findById(id: string): Promise<ApiSuccessResponse<User>>;
}
