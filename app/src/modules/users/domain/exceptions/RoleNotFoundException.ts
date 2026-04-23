import { DomainException } from '../../../../shared/domain/DomainException';

/**
 * Excepción de dominio: Rol no encontrado
 *
 * Esta es una excepción pura de dominio, sin dependencias de framework.
 * El DomainExceptionFilter la convierte automáticamente a HTTP 404.
 */
export class RoleNotFoundException extends DomainException {
  constructor(roleId?: number) {
    super(roleId ? `Rol con ID ${roleId} no encontrado` : 'Rol no encontrado');
  }
}
