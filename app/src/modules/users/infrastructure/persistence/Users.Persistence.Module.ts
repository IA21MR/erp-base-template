/**
 * Módulo de Persistencia de Users
 *
 * Responsabilidad: Configurar repositorios de persistencia usando Prisma
 */

import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../../infrastructure/database/prisma/prisma.module';

// Repositorios
import { PrismaUserRepository } from './PrismaUserRepository';
import { PrismaRoleRepository } from './PrismaRoleRepository';
import { PrismaPermissionRepository } from './PrismaPermissionRepository';

// Tokens
import { USER_REPOSITORY, ROLE_REPOSITORY, PERMISSION_REPOSITORY } from '../../Users.Tokens';

@Module({
  imports: [PrismaModule],
  providers: [
    {
      provide: USER_REPOSITORY,
      useClass: PrismaUserRepository,
    },
    {
      provide: ROLE_REPOSITORY,
      useClass: PrismaRoleRepository,
    },
    {
      provide: PERMISSION_REPOSITORY,
      useClass: PrismaPermissionRepository,
    },
  ],
  exports: [USER_REPOSITORY, ROLE_REPOSITORY, PERMISSION_REPOSITORY],
})
export class UsersPersistenceModule {}
