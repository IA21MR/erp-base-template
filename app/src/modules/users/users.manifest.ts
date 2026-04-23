// Manifest del módulo Users (core). Incluye permisos y roles del sistema.
import { ModuleManifest } from '../../shared/plugin-system/domain/ModuleManifest';
import { UsersModule } from './Users.Module';

export const UsersManifest: ModuleManifest = {
  name: 'users',
  description: 'Usuarios, roles y permisos del sistema',
  version: '1.0.0',
  isCore: true,
  module: UsersModule,
  dependencies: [],
  permissions: [
    'CREATE_USER',
    'READ_USER',
    'UPDATE_USER',
    'DELETE_USER',
    'LIST_USERS',
    'ACTIVATE_USER',
    'DEACTIVATE_USER',
    'ASSIGN_ROLES',
    'MANAGE_ROLES',
    'MANAGE_PERMISSIONS',
  ],
  prismaFragments: ['prisma/fragments/base.prisma'],
  seedScripts: ['prisma/seeds/core.seed.mjs'],
};
