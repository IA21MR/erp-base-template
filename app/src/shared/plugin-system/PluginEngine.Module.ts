import { Global, Module } from '@nestjs/common';
import { PrismaModule } from '../../infrastructure/database/prisma/prisma.module';
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
 *
 * `ModuleGuard` ya NO se registra aquí: pertenece a `OrganizationsModule`
 * (Fase 0.4.1). Solo se activa cuando organizations está activo.
 *
 * Marcado como @Global para que el registry sea accesible desde cualquier módulo.
 */
@Global()
@Module({
  imports: [PrismaModule],
  providers: [
    PluginRegistry,
    OrganizationModuleService,
    {
      provide: ORGANIZATION_MODULE_REPOSITORY,
      useClass: PrismaOrganizationModuleRepository,
    },
  ],
  exports: [PluginRegistry, OrganizationModuleService],
})
export class PluginEngineModule {}
