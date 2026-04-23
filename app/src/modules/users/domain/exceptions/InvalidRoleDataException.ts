import { DomainException } from '../../../../shared/domain/DomainException';

/**
 * Excepción de dominio: Datos de rol inválidos
 *
 * Esta es una excepción pura de dominio, sin dependencias de framework.
 * El DomainExceptionFilter la convierte automáticamente a HTTP 400.
 */
export class InvalidRoleDataException extends DomainException {
  constructor(message: string) {
    super(message);
  }
}
