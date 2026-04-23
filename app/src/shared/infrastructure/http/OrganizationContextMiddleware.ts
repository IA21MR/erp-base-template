import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, TokenExpiredError } from '@nestjs/jwt';
import type { NextFunction, Request, Response } from 'express';

/**
 * Middleware que resuelve la organización activa del request y la expone
 * en `request.organization.id`.
 *
 * Estrategia de resolución (en orden de prioridad):
 *   1. `organizationId` firmado dentro del JWT de access token (TRUSTED).
 *      Se verifica la firma con `JWT_SECRET` antes de confiar en el claim.
 *   2. Header `x-organization-id`  →  SOLO como fallback para entornos
 *      no productivos (`ALLOW_ORGANIZATION_HEADER_FALLBACK=true`) y
 *      únicamente cuando el request NO traiga un JWT válido.
 *
 * 🔒 Razón de seguridad:
 *     Antes el middleware confiaba en el header. Eso permitía a un cliente
 *     autenticado cambiar de organización simplemente alterando el header.
 *     Ahora la organización viaja dentro del JWT firmado y NO puede ser
 *     modificada desde el cliente.
 *
 * ⚠️  Este middleware NO lanza si no hay organización. Un request público
 *     (ej: `/auth/login`) no la necesita. La exigencia la hace
 *     `OrganizationContextGuard` + `ModuleGuard` en la capa de autorización.
 */
@Injectable()
export class OrganizationContextMiddleware implements NestMiddleware {
  private readonly logger = new Logger(OrganizationContextMiddleware.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  use(req: Request, _res: Response, next: NextFunction): void {
    // 1. Intentar resolver desde el JWT (fuente confiable)
    const jwtResolved = this.tryResolveFromJwt(req);
    if (jwtResolved.hadValidJwt) {
      if (jwtResolved.organizationId) {
        req.organization = { id: jwtResolved.organizationId };
      }
      // Un JWT válido SIN organizationId significa que el contexto
      // multi-tenant aún no está decidido. No caemos al header, ya que
      // el usuario está identificado y no debemos permitirle
      // "cambiar" de organización por header.
      return next();
    }

    // 2. Fallback por header SOLO si está habilitado explícitamente
    const allowFallback =
      this.configService.get<string>('ALLOW_ORGANIZATION_HEADER_FALLBACK') === 'true';
    if (!allowFallback) {
      return next();
    }

    const header = req.headers['x-organization-id'];
    const headerValue = Array.isArray(header) ? header[0] : header;
    if (headerValue && typeof headerValue === 'string' && headerValue.trim().length > 0) {
      req.organization = { id: headerValue.trim() };
    }

    next();
  }

  /**
   * Extrae y verifica el JWT del header `Authorization: Bearer <token>`.
   * No lanza: si el token no existe o es inválido, retorna `hadValidJwt=false`
   * y se deja que `JwtAuthGuard` rechace el request en la capa de guardias.
   */
  private tryResolveFromJwt(req: Request): {
    hadValidJwt: boolean;
    organizationId: string | null;
  } {
    const authHeader = req.headers['authorization'];
    if (!authHeader || typeof authHeader !== 'string') {
      return { hadValidJwt: false, organizationId: null };
    }
    const match = authHeader.match(/^Bearer\s+(.+)$/i);
    if (!match) return { hadValidJwt: false, organizationId: null };

    const token = match[1];
    const secret = this.configService.get<string>('JWT_SECRET');
    if (!secret) return { hadValidJwt: false, organizationId: null };

    try {
      const decoded = this.jwtService.verify<Record<string, unknown>>(token, { secret });
      const organizationId =
        typeof decoded.organizationId === 'string' ? decoded.organizationId : null;
      return { hadValidJwt: true, organizationId };
    } catch (err) {
      // Token mal firmado / corrupto / expirado → no poblar y dejar que el guard lo rechace.
      if (err instanceof TokenExpiredError) {
        this.logger.debug('JWT expirado al resolver contexto de organización');
      }
      return { hadValidJwt: false, organizationId: null };
    }
  }
}
