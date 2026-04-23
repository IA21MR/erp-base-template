import { DomainException } from '../../../../shared/domain/DomainException';

/**
 * Excepcion de dominio: desactivacion entre administradores no permitida
 *
 * Se lanza cuando un administrador intenta desactivar a otro administrador.
 * El DomainExceptionFilter la convierte automaticamente a HTTP 403.
 */
export class AdminDeactivationForbiddenException extends DomainException {
  constructor() {
    super('No puedes desactivar a otro usuario administrador');
  }
}
