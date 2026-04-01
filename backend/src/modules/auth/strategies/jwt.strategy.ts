import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

/** Payload contenido dentro del token JWT */
export interface JwtPayload {
  sub: string;    // userId
  email: string;
  iat?: number;
  exp?: number;
}

/** Objeto que queda en req.user tras validación */
export interface AuthenticatedUser {
  id: string;
  email: string;
}

/**
 * Estrategia JWT para Passport.
 * Extrae el token del header Authorization: Bearer <token>.
 * Valida firma y expiración automáticamente.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET', 'change-me-in-production'),
    });
  }

  /**
   * Llamado después de validar el token.
   * Lo que retorne este método se asigna a req.user.
   */
  validate(payload: JwtPayload): AuthenticatedUser {
    return {
      id: payload.sub,
      email: payload.email,
    };
  }
}
