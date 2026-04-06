export declare class CreateUserDto {
    email: string;
    password: string;
    phone?: string;
    preferredLanguage?: string;
    signupRole?: 'investor' | 'entrepreneur';
}
