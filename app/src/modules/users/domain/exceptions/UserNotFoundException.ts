import { DomainException } from '../../../../shared/domain/DomainException';

/**
 * Excepción de dominio: Usuario no encontrado
 *
 * Esta es una excepción pura de dominio, sin dependencias de framework.
 * El DomainExceptionFilter la convierte automáticamente a HTTP 404.
 */
export class UserNotFoundException extends DomainException {
  constructor(userId?: number) {
    super(
      userId
        ? `Usuario con ID ${userId} no encontrado`
        : 'Usuario no encontrado'
    );
  }
}
