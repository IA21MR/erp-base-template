/**
 * OrganizationsModule — wires the Organizations bounded context.
 */
import { Module } from '@nestjs/common';
import { PrismaModule } from '../../infrastructure/database/prisma/prisma.module';
import { PermissionsGuard } from '../../shared/infrastructure/guards/PermissionsGuard';

import { OrganizationsPersistenceModule } from './infrastructure/persistence/Organizations.Persistence.Module';
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
  imports: [PrismaModule, OrganizationsPersistenceModule],
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
  ],
  exports: [
    CreateOrganizationUseCase,
    UpdateOrganizationUseCase,
    GetOrganizationByIdUseCase,
    ListOrganizationsUseCase,
  ],
})
export class OrganizationsModule {}
