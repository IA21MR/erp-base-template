import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './infrastructure/database/prisma/prisma.module';
import { DatabaseModule } from './shared/database/database.module';
import { EventsModule } from './shared/infrastructure/events/Events.module';
import { PluginEngineModule } from './shared/plugin-system/PluginEngine.Module';
import { PluginRegistry } from './shared/plugin-system/application/PluginRegistry';
import { buildModulesFromConfig, resolveActiveManifests } from './shared/plugin-system/application/buildModulesFromConfig';
import { ACTIVE_MODULES } from './modules.config';
import { ContactsPlugin } from './modules/contacts/plugin/ContactsPlugin';

// Infra base siempre presente (no es "módulo de negocio").
const INFRASTRUCTURE_MODULES = [
  ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
  DatabaseModule,
  PrismaModule,
  EventsModule,
  PluginEngineModule,
];

// Módulos de negocio resueltos desde `modules.config.ts`.
// El generador de proyectos reescribe ACTIVE_MODULES para cada cliente.
const BUSINESS_MODULES = buildModulesFromConfig(ACTIVE_MODULES);

@Module({
  imports: [...INFRASTRUCTURE_MODULES, ...BUSINESS_MODULES],
})
export class AppModule {
  constructor(private readonly pluginRegistry: PluginRegistry) {
    // Registro de plugins disponibles en runtime.
    // Solo registramos plugins cuyo módulo esté activo en este proyecto.
    const activeNames = new Set(
      resolveActiveManifests(ACTIVE_MODULES).map((m) => m.name),
    );
    if (activeNames.has('contacts')) {
      this.pluginRegistry.register(ContactsPlugin);
    }
  }
}

