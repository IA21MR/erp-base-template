/**
 * OrganizationsModule — wires the Organizations bounded context.
 *
 * Responsabilidad adicional (Fase 0.4.1):
 * Este módulo es el DUEÑO del contexto multi-tenant. Cuando está activo,
 * registra como APP_GUARD su cadena de guards tenant-aware:
 *   2. OrganizationContextGuard → materializa request.organization.id desde JWT
 *   3. ModuleGuard              → valida módulo habilitado por organización
 *
 * Si este módulo NO está activo (core-only), esos guards simplemente no se
 * registran — la app corre en modo single-tenant sin complejidad extra.
 */
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaModule } from '../../infrastructure/database/prisma/prisma.module';
import { PermissionsGuard } from '../../shared/infrastructure/guards/PermissionsGuard';

import { OrganizationsPersistenceModule } from './infrastructure/persistence/Organizations.Persistence.Module';
import { OrganizationContextGuard } from './infrastructure/guards/OrganizationContextGuard';
import { ModuleGuard } from './infrastructure/guards/ModuleGuard';
import { OrganizationContextMiddleware } from './infrastructure/http/OrganizationContextMiddleware';
import {
  ActivateOrganizationUseCase,
  CreateOrganizationUseCase,
  DeactivateOrganizationUseCase,
  GetOrganizationByIdUseCase,
  ListOrganizationsUseCase,
  SearchOrganizationsUseCase,
  SetPrimaryOrganizationUseCase,
  UpdateBrandingSettingsUseCase,
  UpdateFiscalSettingsUseCase,
  UpdateNotificationSettingsUseCase,
  UpdateOrganizationUseCase,
  UpdateRegionalSettingsUseCase,
} from './application/use-cases';
import { OrganizationsController } from './interfaces/http/controllers/Organizations.Controller';

@Module({
  imports: [
    PrismaModule,
    ConfigModule,
    OrganizationsPersistenceModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: configService.get<string>('JWT_ACCESS_TOKEN_EXPIRATION', '15m') },
      }),
    }),
  ],
  controllers: [OrganizationsController],
  providers: [
    CreateOrganizationUseCase,
    UpdateOrganizationUseCase,
    ActivateOrganizationUseCase,
    DeactivateOrganizationUseCase,
    SetPrimaryOrganizationUseCase,
    GetOrganizationByIdUseCase,
    ListOrganizationsUseCase,
    SearchOrganizationsUseCase,
    UpdateRegionalSettingsUseCase,
    UpdateFiscalSettingsUseCase,
    UpdateNotificationSettingsUseCase,
    UpdateBrandingSettingsUseCase,
    PermissionsGuard,

    // Guards tenant-aware: solo se registran cuando organizations está activo.
    OrganizationContextGuard,
    OrganizationContextMiddleware,
    { provide: APP_GUARD, useExisting: OrganizationContextGuard },
    { provide: APP_GUARD, useExisting: ModuleGuard },
  ],
  exports: [
    CreateOrganizationUseCase,
    UpdateOrganizationUseCase,
    GetOrganizationByIdUseCase,
    ListOrganizationsUseCase,
  ],
})
export class OrganizationsModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(OrganizationContextMiddleware).forRoutes('*');
  }
}
