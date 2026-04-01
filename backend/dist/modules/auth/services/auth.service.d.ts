import { JwtService } from '@nestjs/jwt';
import { UserRepository } from '../../users/repositories';
import { User } from '../../users/models';
import { LoginDto } from '../dto';
export interface LoginResponse {
    accessToken: string;
    tokenType: string;
    expiresIn: string;
    user: User;
}
export declare class AuthService {
    private readonly userRepo;
    private readonly jwtService;
    private readonly logger;
    constructor(userRepo: UserRepository, jwtService: JwtService);
    login(dto: LoginDto, ip?: string): Promise<LoginResponse>;
    validateToken(userId: string): Promise<User>;
}
