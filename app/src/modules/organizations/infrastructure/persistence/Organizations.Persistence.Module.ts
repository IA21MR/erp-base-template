/**
 * Módulo de persistencia de Organizations — registra el repositorio Prisma
 * y el registry de políticas de TaxId bajo sus tokens.
 */
import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../../infrastructure/database/prisma/prisma.module';
import { ORGANIZATION_REPOSITORY, TAX_ID_POLICY_REGISTRY } from '../../Organizations.Tokens';
import { PrismaOrganizationRepository } from './PrismaOrganizationRepository';
import { DefaultTaxIdPolicyRegistry } from '../policies/DefaultTaxIdPolicyRegistry';

@Module({
  imports: [PrismaModule],
  providers: [
    { provide: ORGANIZATION_REPOSITORY, useClass: PrismaOrganizationRepository },
    { provide: TAX_ID_POLICY_REGISTRY, useClass: DefaultTaxIdPolicyRegistry },
  ],
  exports: [ORGANIZATION_REPOSITORY, TAX_ID_POLICY_REGISTRY],
})
export class OrganizationsPersistenceModule {}
