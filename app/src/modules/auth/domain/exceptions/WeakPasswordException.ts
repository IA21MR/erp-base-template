import { DomainException } from '../../../../shared/domain/DomainException';

// Excepción de dominio para contraseña que no cumple requisitos de seguridad
export class WeakPasswordException extends DomainException {
  constructor(message: string) {
    super(message);
  }
}
