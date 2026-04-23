// Guard para validar permisos (RF-R2)
// El sistema debe restringir las acciones disponibles según el rol

import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

export const PERMISSIONS_KEY = 'permissions';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Obtener los permisos requeridos del decorador
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()]
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true; // Si no se especifican permisos, permitir acceso
    }

    // Obtener el usuario del request (viene del JWT decodificado)
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('Usuario no autenticado');
    }

    // Verificar si el usuario tiene los permisos en su JWT
    const userPermissions: string[] = user.permissions || [];

    if (userPermissions.length === 0) {
      throw new ForbiddenException('El usuario no tiene permisos asignados');
    }

    // Verificar si el usuario tiene al menos uno de los permisos requeridos
    const hasPermission = requiredPermissions.some((permission) =>
      userPermissions.includes(permission)
    );

    if (!hasPermission) {
      throw new ForbiddenException(
        'No tienes permisos suficientes para realizar esta acción'
      );
    }

    return true;
  }
}
