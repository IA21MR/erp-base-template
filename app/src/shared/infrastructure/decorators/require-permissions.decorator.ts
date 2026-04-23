// Decorador para especificar permisos requeridos en los endpoints

import { SetMetadata } from '@nestjs/common';
import { PERMISSIONS_KEY } from '../guards/PermissionsGuard';

export const RequirePermissions = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
