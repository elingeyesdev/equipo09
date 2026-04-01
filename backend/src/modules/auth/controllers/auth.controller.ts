import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Request } from 'express';

import { AuthService, LoginResponse } from '../services';
import { LoginDto } from '../dto';
import { JwtAuthGuard } from '../guards';
import { ApiSuccessResponse } from '../../../common/dto';
import { User } from '../../users/models';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * POST /auth/login
   * Autentica al usuario y retorna un JWT access token.
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Iniciar sesión y obtener token JWT' })
  @ApiResponse({
    status: 200,
    description: 'Login exitoso. Retorna access_token.',
  })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas.' })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos.' })
  async login(
    @Body() dto: LoginDto,
    @Req() req: Request,
  ): Promise<ApiSuccessResponse<LoginResponse>> {
    const ip = req.ip;
    const result = await this.authService.login(dto, ip);
    return new ApiSuccessResponse(result, 'Login exitoso');
  }

  /**
   * GET /auth/me
   * Retorna el usuario autenticado (requiere token).
   * Alias conveniente de GET /users/me.
   */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Verificar token y obtener usuario autenticado' })
  @ApiResponse({ status: 200, description: 'Token válido. Usuario retornado.' })
  @ApiResponse({ status: 401, description: 'Token inválido o expirado.' })
  async me(@Req() req: Request): Promise<ApiSuccessResponse<User>> {
    const user = (req as any).user as User;
    return new ApiSuccessResponse(user, 'Token válido');
  }
}
