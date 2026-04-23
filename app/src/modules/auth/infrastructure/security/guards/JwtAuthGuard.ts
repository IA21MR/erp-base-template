// Guard de autenticación JWT
// Protege rutas requiriendo un token JWT válido.
//
// Respeta el decorador `@Public()`: si un endpoint lo tiene, se
// permite el acceso sin token. Esto habilita el uso del guard como
// APP_GUARD global sin romper los endpoints públicos de `/auth/*`.

import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/Public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;
    return super.canActivate(context);
  }
}
