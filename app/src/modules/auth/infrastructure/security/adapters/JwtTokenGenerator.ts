// Adaptador de JWT para el puerto TokenGenerator
// Implementación concreta de la generación de tokens usando @nestjs/jwt

import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import {
  TokenGenerator,
  TokenPayload,
  RefreshTokenPayload,
} from '../../../application/ports/TokenGenerator.interface';

@Injectable()
export class JwtTokenGenerator implements TokenGenerator {
  private readonly refreshSecret: string;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    const refreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET');
    if (!refreshSecret) {
      throw new Error('JWT_REFRESH_SECRET no está definido en las variables de entorno');
    }
    this.refreshSecret = refreshSecret;
  }

  sign(payload: TokenPayload): string {
    const accessTokenTtl = this.configService.get<string>('JWT_ACCESS_TOKEN_EXPIRATION', '15m');

    return this.jwtService.sign(
      {
        sub: payload.sub,
        email: payload.email,
        organizationId: payload.organizationId ?? null,
        roles: payload.roles ?? [],
        permissions: payload.permissions ?? [],
      },
      {
        expiresIn: accessTokenTtl as any,
      }
    );
  }

  signRefresh(payload: RefreshTokenPayload): string {
    const refreshTokenTtl = this.configService.get<string>('JWT_REFRESH_TOKEN_EXPIRATION', '7d');

    return this.jwtService.sign(
      {
        sub: payload.sub,
        email: payload.email,
        organizationId: payload.organizationId ?? null,
      },
      {
        secret: this.refreshSecret,
        expiresIn: refreshTokenTtl as any,
      }
    );
  }

  verifyRefresh(token: string): RefreshTokenPayload {
    const decoded = this.jwtService.verify(token, { secret: this.refreshSecret });
    return {
      sub: decoded.sub,
      email: decoded.email,
      organizationId: decoded.organizationId ?? null,
    };
  }

  verify(token: string): TokenPayload {
    const decoded = this.jwtService.verify(token);
    return {
      sub: decoded.sub,
      email: decoded.email,
      organizationId: decoded.organizationId ?? null,
      roles: decoded.roles ?? [],
      permissions: decoded.permissions ?? [],
    };
  }
}
