/**
 * Public Decorator
 *
 * Marca un endpoint como público (no requiere autenticación JWT).
 * Usado por el JwtAuthGuard para decidir si validar el token.
 */

import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Decorador para marcar endpoints como públicos.
 * Estos endpoints no requieren token JWT.
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
