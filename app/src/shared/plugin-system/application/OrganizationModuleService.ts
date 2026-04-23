import { Inject, Injectable, Logger } from '@nestjs/common';
import { ORGANIZATION_MODULE_REPOSITORY } from '../PluginSystem.Tokens';
import type { OrganizationModuleRepository } from '../domain/OrganizationModuleRepository.interface';
import { PluginRegistry } from './PluginRegistry';

/**
 * Service de acceso a módulos habilitados por organización.
 *
 * Incluye caché in-memory con TTL corto para evitar hits a DB
 * en cada request (el guard se ejecuta en cada endpoint).
 */
@Injectable()
export class OrganizationModuleService {
  private readonly logger = new Logger(OrganizationModuleService.name);
  private readonly cache = new Map<string, { value: boolean; expiresAt: number }>();
  private readonly ttlMs = 30_000; // 30s

  constructor(
    @Inject(ORGANIZATION_MODULE_REPOSITORY)
    private readonly repo: OrganizationModuleRepository,
    private readonly pluginRegistry: PluginRegistry,
  ) {}

  async isEnabled(organizationId: string, moduleName: string): Promise<boolean> {
    // Core plugins están siempre habilitados, sin DB.
    const plugin = this.pluginRegistry.get(moduleName);
    if (plugin?.isCore) return true;

    const key = `${organizationId}:${moduleName}`;
    const cached = this.cache.get(key);
    const now = Date.now();
    if (cached && cached.expiresAt > now) {
      return cached.value;
    }
    const value = await this.repo.isEnabled(organizationId, moduleName);
    this.cache.set(key, { value, expiresAt: now + this.ttlMs });
    return value;
  }

  async listEnabled(organizationId: string): Promise<string[]> {
    return this.repo.listEnabled(organizationId);
  }

  async enable(organizationId: string, moduleName: string): Promise<void> {
    await this.repo.enable(organizationId, moduleName);
    this.invalidate(organizationId, moduleName);
  }

  async disable(organizationId: string, moduleName: string): Promise<void> {
    await this.repo.disable(organizationId, moduleName);
    this.invalidate(organizationId, moduleName);
  }

  /**
   * Habilita los plugins por defecto para una nueva organización.
   *
   * Por defecto habilita TODOS los plugins no-core registrados en el
   * `PluginRegistry`. Si en el futuro se requiere un subset (ej: por plan),
   * recibir la lista explícita como parámetro.
   */
  async enableDefaultsForNewOrganization(
    organizationId: string,
    explicitModules?: string[],
  ): Promise<void> {
    const modules =
      explicitModules ??
      this.pluginRegistry
        .getAll()
        .filter((p) => !p.isCore)
        .map((p) => p.name);

    if (modules.length === 0) {
      this.logger.debug(`No hay plugins por defecto para organización ${organizationId}`);
      return;
    }

    await this.repo.enableMany(organizationId, modules);
    for (const m of modules) this.invalidate(organizationId, m);
    this.logger.log(
      `Módulos por defecto habilitados para org=${organizationId}: [${modules.join(', ')}]`,
    );
  }

  private invalidate(organizationId: string, moduleName: string): void {
    this.cache.delete(`${organizationId}:${moduleName}`);
  }
}
