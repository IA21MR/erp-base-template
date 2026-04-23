import { DomainException } from '../../../../shared/domain/DomainException';

// Excepción de dominio para código de restablecimiento inválido
export class InvalidResetCodeException extends DomainException {
  constructor(message: string = 'Código inválido o expirado') {
    super(message);
  }
}
