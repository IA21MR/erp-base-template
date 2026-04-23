import { DomainException } from '../../../../shared/domain/DomainException';

// Excepción de dominio: Cuenta bloqueada por intentos fallidos
// Se lanza cuando el usuario ha excedido el máximo de intentos de login
export class AccountLockedException extends DomainException {
  constructor(minutesRemaining?: number) {
    const message = minutesRemaining
      ? `Cuenta bloqueada por demasiados intentos fallidos. Intente nuevamente en ${minutesRemaining} minutos`
      : 'Cuenta bloqueada por demasiados intentos fallidos';
    super(message);
  }
}
