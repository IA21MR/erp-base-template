import { DomainException } from '../../../../shared/domain/DomainException';

/**
 * Excepción de dominio: Usuario ya está activo
 *
 * Se lanza cuando se intenta activar un usuario que ya está activo.
 * El DomainExceptionFilter la convierte automáticamente a HTTP 409.
 */
export class UserAlreadyActiveException extends DomainException {
  constructor(userId?: number) {
    super(
      userId
        ? `El usuario con ID ${userId} ya está activo`
        : 'El usuario ya está activo'
    );
  }
}
