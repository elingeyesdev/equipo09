import { UserRepository } from '../repositories';
import { CreateUserDto } from '../dto';
import { User } from '../models';
export declare class UserService {
    private readonly userRepo;
    private readonly logger;
    constructor(userRepo: UserRepository);
    register(dto: CreateUserDto): Promise<User>;
    findById(id: string): Promise<User>;
    getMe(userId: string): Promise<User>;
}
