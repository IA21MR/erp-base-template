import { DomainException } from '../../../../shared/domain/DomainException';

// Excepción de dominio para código de restablecimiento ya utilizado
export class UsedResetCodeException extends DomainException {
  constructor(message: string = 'Código ya utilizado') {
    super(message);
  }
}
