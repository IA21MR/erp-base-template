// Decorador que marca un endpoint como perteneciente a un módulo/plugin.
// Se usa en conjunto con `ModuleGuard` para validar que la organización
// del request tenga ese módulo habilitado.

import { SetMetadata } from '@nestjs/common';

export const MODULE_ACCESS_KEY = 'module';

export const ModuleAccess = (moduleName: string) =>
  SetMetadata(MODULE_ACCESS_KEY, moduleName);
