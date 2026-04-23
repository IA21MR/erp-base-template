// Manifest del módulo Auth (core).
import { ModuleManifest } from '../../shared/plugin-system/domain/ModuleManifest';
import { AuthModule } from './infrastructure/auth.module';

export const AuthManifest: ModuleManifest = {
  name: 'auth',
  description: 'Autenticación, JWT, rate limiting, recuperación de contraseña',
  version: '1.0.0',
  isCore: true,
  module: AuthModule,
  dependencies: ['users'],
  permissions: [],
  prismaFragments: [],
  seedScripts: [],
};
