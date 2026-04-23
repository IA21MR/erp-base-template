import { DomainException } from '../../../../shared/domain/DomainException';

/**
 * Excepción de dominio: Permiso no encontrado
 *
 * Esta es una excepción pura de dominio, sin dependencias de framework.
 * El DomainExceptionFilter la convierte automáticamente a HTTP 404.
 */
export class PermissionNotFoundException extends DomainException {
  constructor(permissionIds?: number[]) {
    super(
      permissionIds
        ? `Uno o más permisos no encontrados: ${permissionIds.join(', ')}`
        : 'Permiso no encontrado'
    );
  }
}
