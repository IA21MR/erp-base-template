// Estrategia JWT para Passport
// Valida y decodifica los tokens JWT en las peticiones

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

/**
 * Payload canónico que se firma en los JWT de access token del ERP.
 * Incluye organización activa (multi-tenant) y roles/permisos del usuario
 * al momento del login/refresh.
 *
 * 🔒 Este payload es la ÚNICA fuente de verdad para el contexto
 *     de seguridad del request. No se debe confiar en headers.
 */
export interface JwtPayload {
  sub: number;
  email: string;
  organizationId: string | null;
  roles: string[];
  permissions: string[];
}

/**
 * Lo que Passport inyecta en `request.user` tras validar el JWT.
 */
export interface AuthenticatedUser {
  id: number;
  email: string;
  organizationId: string | null;
  roles: string[];
  permissions: string[];
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    const secret = configService.get<string>('JWT_SECRET');
    if (!secret) {
      throw new Error('JWT_SECRET no está definido en las variables de entorno');
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: JwtPayload): Promise<AuthenticatedUser> {
    if (!payload.sub || !payload.email) {
      throw new UnauthorizedException('Token inválido');
    }

    return {
      id: payload.sub,
      email: payload.email,
      organizationId: payload.organizationId ?? null,
      roles: Array.isArray(payload.roles) ? payload.roles : [],
      permissions: Array.isArray(payload.permissions) ? payload.permissions : [],
    };
  }
}
