/**
 * OrganizationContextGuard
 *
 * Guard de infraestructura CORE que materializa la organización activa
 * del usuario autenticado en `request.organization.id` a partir del JWT
 * (`request.user.organizationId`).
 *
 * Debe ejecutarse DESPUÉS de `JwtAuthGuard` y ANTES de `ModuleGuard` /
 * `PermissionsGuard`. Esa es la razón por la que se registra como
 * APP_GUARD en orden específico (ver `auth.module.ts`).
 *
 * Reglas:
 *   - Endpoints marcados con `@Public()` → pasa (sin tocar `request.organization`).
 *   - Si el request NO está autenticado → pasa (ya será rechazado por
 *     `JwtAuthGuard` u otro guard de la cadena).
 *   - Si el usuario autenticado tiene `organizationId` en el JWT → se fija
 *     `request.organization.id` con ese valor. Si previamente había un
 *     header `x-organization-id` distinto, éste se sobrescribe
 *     (el JWT es la única fuente de verdad).
 *   - Si el usuario autenticado NO tiene `organizationId` → NO se toca
 *     `request.organization`. La exigencia (si aplica) la hace
 *     `ModuleGuard` con el mensaje correspondiente.
 *
 * Retorna siempre `true` (no rechaza). Su responsabilidad es enriquecer el
 * request con el contexto multi-tenant, no autorizar.
 */
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../../../auth/infrastructure/security/decorators/Public.decorator';

@Injectable()
export class OrganizationContextGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest();
    const user = request?.user as
      | { organizationId?: string | null }
      | undefined;
    if (!user) return true;

    if (user.organizationId && typeof user.organizationId === 'string') {
      // El JWT es autoridad: sobreescribe cualquier header previo.
      request.organization = { id: user.organizationId };
    }

    return true;
  }
}
