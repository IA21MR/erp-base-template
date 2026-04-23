import { Global, Module } from '@nestjs/common';
import { PrismaModule } from '../../infrastructure/database/prisma/prisma.module';
import { ModuleGuard } from '../infrastructure/guards/ModuleGuard';
import { PluginRegistry } from './application/PluginRegistry';
import { OrganizationModuleService } from './application/OrganizationModuleService';
import { ORGANIZATION_MODULE_REPOSITORY } from './PluginSystem.Tokens';
import { PrismaOrganizationModuleRepository } from './infrastructure/persistence/PrismaOrganizationModuleRepository';

/**
 * Plugin Engine — módulo CORE siempre activo.
 *
 * Exporta:
 *  - `PluginRegistry`: catálogo in-memory de plugins disponibles.
 *  - `OrganizationModuleService`: API para consultar/mutar estado de módulos por org.
 *  - `ModuleGuard`: guard que se registra como APP_GUARD desde `AuthModule`
 *    (ver allí el orden exacto de la cadena de guards).
 *
 * Marcado como @Global para que el registry y el guard sean accesibles
 * desde cualquier módulo sin necesidad de reimportarlo.
 */
@Global()
@Module({
  imports: [PrismaModule],
  providers: [
    PluginRegistry,
    OrganizationModuleService,
    ModuleGuard,
    {
      provide: ORGANIZATION_MODULE_REPOSITORY,
      useClass: PrismaOrganizationModuleRepository,
    },
  ],
  exports: [PluginRegistry, OrganizationModuleService, ModuleGuard],
})
export class PluginEngineModule {}
