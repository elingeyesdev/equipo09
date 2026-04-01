import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserRepository } from '../../users/repositories';
import { User } from '../../users/models';
import { LoginDto } from '../dto';
import {
  UnauthorizedException,
  NotFoundException,
} from '../../../common/exceptions';

export interface LoginResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: string;
  user: User;
}

/**
 * Service: Autenticación
 * Gestiona login con validación de password y generación de JWT.
 */
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly userRepo: UserRepository,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Valida credenciales y genera un access token JWT.
   * Reglas:
   *  - El usuario debe existir y estar activo.
   *  - El password debe coincidir con el hash almacenado.
   */
  async login(dto: LoginDto, ip?: string): Promise<LoginResponse> {
    this.logger.log(`Intento de login: ${dto.email}`);

    // 1. Buscar usuario con hash
    const result = await this.userRepo.findByEmailWithPassword(dto.email);
    if (!result) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const { user, passwordHash } = result;

    // 2. Verificar password
    const isPasswordValid = await bcrypt.compare(dto.password, passwordHash);
    if (!isPasswordValid) {
      await this.userRepo.incrementFailedAttempts(user.id);
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // 3. Actualizar último login
    await this.userRepo.updateLastLogin(user.id, ip);

    // 4. Generar JWT
    const payload = { sub: user.id, email: user.email };
    const accessToken = this.jwtService.sign(payload);

    this.logger.log(`Login exitoso: ${user.id}`);

    return {
      accessToken,
      tokenType: 'Bearer',
      expiresIn: process.env.JWT_EXPIRES_IN ?? '24h',
      user,
    };
  }

  /**
   * Valida un token JWT y retorna el usuario asociado.
   * Usado internamente por la estrategia Passport.
   */
  async validateToken(userId: string): Promise<User> {
    const user = await this.userRepo.findById(userId);
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Token inválido o usuario inactivo');
    }
    return user;
  }
}
