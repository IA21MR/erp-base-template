import { DomainException } from '../../../../shared/domain/DomainException';

/**
 * Excepción de dominio: Datos de usuario inválidos
 *
 * Esta es una excepción pura de dominio, sin dependencias de framework.
 * El DomainExceptionFilter la convierte automáticamente a HTTP 400.
 */
export class InvalidUserDataException extends DomainException {
  constructor(message: string) {
    super(message);
  }
}
