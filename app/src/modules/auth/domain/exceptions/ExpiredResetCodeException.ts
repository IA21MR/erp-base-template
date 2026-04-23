import { DomainException } from '../../../../shared/domain/DomainException';

// Excepción de dominio para código de restablecimiento expirado
export class ExpiredResetCodeException extends DomainException {
  constructor(message: string = 'Código expirado. Solicita uno nuevo') {
    super(message);
  }
}
