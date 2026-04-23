// Guard global que valida que el módulo/plugin requerido por la ruta
// esté habilitado para la organización del request.
//
// Reglas:
//   - Si el handler NO tiene @ModuleAccess(...) → pasa.
//   - Si el plugin está registrado como `isCore: true` → pasa sin hit a DB.
//   - El `organizationId` se lee ÚNICAMENTE desde `request.organization.id`
//     (alimentado por `OrganizationContextGuard` a partir del JWT,
//     o por el middleware cuando aplica el fallback por header).
//     Está prohibido leer organizationId desde body / params / query / headers
//     directamente en guards o use-cases: eso permite evadir el aislamiento
//     multi-tenant.
//   - Adicionalmente se valida consistencia con el JWT: si el request está
//     autenticado (`request.user.organizationId` presente) y el
//     `request.organization.id` no coincide → 403. Eso protege contra
//     cualquier intento de cross-tenant por manipulación del header.
//   - Si no hay organización resuelta → 400.
//   - Si el módulo no está habilitado para esa organización → 403.

import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { OrganizationModuleService } from '../../../../shared/plugin-system/application/OrganizationModuleService';
import { PluginRegistry } from '../../../../shared/plugin-system/application/PluginRegistry';
import { MODULE_ACCESS_KEY } from '../../../../shared/infrastructure/decorators/module-access.decorator';

@Injectable()
export class ModuleGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly organizationModuleService: OrganizationModuleService,
    private readonly pluginRegistry: PluginRegistry,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const moduleName = this.reflector.getAllAndOverride<string | undefined>(
      MODULE_ACCESS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!moduleName) return true;

    // Shortcut: plugins core están siempre activos.
    const plugin = this.pluginRegistry.get(moduleName);
    if (plugin?.isCore) return true;

    const request = context.switchToHttp().getRequest();
    const organizationId: string | undefined = request?.organization?.id;
    const userOrganizationId: string | null | undefined = request?.user?.organizationId;

    if (!organizationId) {
      throw new BadRequestException(
        `No se pudo determinar la organización para validar el módulo "${moduleName}". ` +
          `El JWT no contiene organizationId y no hay fallback habilitado.`,
      );
    }

    // Defensa en profundidad: si el usuario está autenticado, el contexto
    // resuelto DEBE coincidir con lo que firma el JWT. Si alguien intentó
    // inyectar una organización distinta por header/body, se rechaza.
    if (
      typeof userOrganizationId === 'string' &&
      userOrganizationId !== organizationId
    ) {
      throw new ForbiddenException(
        'El contexto de organización no coincide con el usuario autenticado.',
      );
    }

    const enabled = await this.organizationModuleService.isEnabled(
      organizationId,
      moduleName,
    );

    if (!enabled) {
      throw new ForbiddenException(
        `El módulo "${moduleName}" no está habilitado para esta organización.`,
      );
    }

    return true;
  }
}
