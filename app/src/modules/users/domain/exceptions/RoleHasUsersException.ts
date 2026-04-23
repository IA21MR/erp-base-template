import { DomainException } from '../../../../shared/domain/DomainException';

/**
 * Excepción de dominio: Rol tiene usuarios asignados
 *
 * Esta es una excepción pura de dominio, sin dependencias de framework.
 * El DomainExceptionFilter la convierte automáticamente a HTTP 409.
 */
export class RoleHasUsersException extends DomainException {
  constructor(roleId: number) {
    super(
      `No se puede eliminar el rol con ID ${roleId} porque tiene usuarios asignados`
    );
  }
}
