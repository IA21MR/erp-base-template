import { DomainException } from '../../../../shared/domain/DomainException';

/**
 * Excepción de dominio: Email duplicado
 *
 * Esta es una excepción pura de dominio, sin dependencias de framework.
 * El DomainExceptionFilter la convierte automáticamente a HTTP 409.
 */
export class DuplicateEmailException extends DomainException {
  constructor(email: string) {
    super(`El email ${email} ya está en uso`);
  }
}
