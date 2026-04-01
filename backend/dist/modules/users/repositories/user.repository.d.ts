import { BaseRepository } from '../../../common/database';
import { User } from '../models';
import { CreateUserDto } from '../dto';
export declare class UserRepository extends BaseRepository {
    create(dto: CreateUserDto): Promise<User>;
    findById(id: string): Promise<User | null>;
    findByEmail(email: string): Promise<User | null>;
    findByEmailWithPassword(email: string): Promise<{
        user: User;
        passwordHash: string;
    } | null>;
    existsByEmail(email: string): Promise<boolean>;
    findByIdWithRoles(id: string): Promise<User | null>;
    updateLastLogin(userId: string, ip?: string): Promise<void>;
    incrementFailedAttempts(userId: string): Promise<void>;
    seedSuperAdmin(passwordHash: string): Promise<void>;
}
