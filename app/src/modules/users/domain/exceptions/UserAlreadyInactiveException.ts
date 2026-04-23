import { DomainException } from '../../../../shared/domain/DomainException';

/**
 * Excepción de dominio: Usuario ya está inactivo
 *
 * Se lanza cuando se intenta desactivar un usuario que ya está inactivo.
 * El DomainExceptionFilter la convierte automáticamente a HTTP 409.
 */
export class UserAlreadyInactiveException extends DomainException {
  constructor(userId?: number) {
    super(
      userId
        ? `El usuario con ID ${userId} ya está inactivo`
        : 'El usuario ya está inactivo'
    );
  }
}
