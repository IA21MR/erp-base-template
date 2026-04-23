import { DomainException } from '../../../../shared/domain/DomainException';

/**
 * Excepción de dominio: Rol duplicado
 *
 * Esta es una excepción pura de dominio, sin dependencias de framework.
 * El DomainExceptionFilter la convierte automáticamente a HTTP 409.
 */
export class DuplicateRoleException extends DomainException {
  constructor(roleName: string) {
    super(`Ya existe un rol con el nombre "${roleName}"`);
  }
}
