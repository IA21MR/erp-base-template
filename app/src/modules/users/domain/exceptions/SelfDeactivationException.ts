import { DomainException } from '../../../../shared/domain/DomainException';

/**
 * Excepción de dominio: Auto-desactivación no permitida
 *
 * Se lanza cuando un usuario intenta desactivarse a sí mismo.
 * El DomainExceptionFilter la convierte automáticamente a HTTP 403.
 */
export class SelfDeactivationException extends DomainException {
  constructor() {
    super('No puedes desactivar tu propia cuenta');
  }
}
