import { Injectable, Logger } from '@nestjs/common';
import { Plugin } from '../domain/Plugin.interface';

/**
 * Registro central de plugins de la aplicación.
 *
 * Responsabilidades:
 *  - Mantener el catálogo de plugins disponibles en runtime.
 *  - Exponer la lista de plugins para introspección (ej: endpoint de salud, seeds).
 *
 * No realiza verificación de habilitación por organización.
 * Eso es responsabilidad de `OrganizationModuleService` + `ModuleGuard`.
 */
@Injectable()
export class PluginRegistry {
  private readonly logger = new Logger(PluginRegistry.name);
  private readonly plugins = new Map<string, Plugin>();

  register(plugin: Plugin): void {
    if (!plugin?.name) {
      throw new Error('Plugin.name es requerido');
    }
    if (this.plugins.has(plugin.name)) {
      this.logger.warn(`Plugin "${plugin.name}" ya estaba registrado. Se sobrescribe.`);
    }
    this.plugins.set(plugin.name, plugin);
    this.logger.log(
      `Plugin registrado: ${plugin.name}${plugin.version ? ` v${plugin.version}` : ''}`,
    );
  }

  get(name: string): Plugin | undefined {
    return this.plugins.get(name);
  }

  has(name: string): boolean {
    return this.plugins.has(name);
  }

  getAll(): Plugin[] {
    return Array.from(this.plugins.values());
  }

  getAllPermissions(): string[] {
    const all = new Set<string>();
    for (const plugin of this.plugins.values()) {
      (plugin.permissions ?? []).forEach((p) => all.add(p));
    }
    return Array.from(all);
  }
}
