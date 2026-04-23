import { DomainException } from '../../../../shared/domain/DomainException';

// Excepción de dominio para errores al enviar email
export class EmailSendingException extends DomainException {
  constructor(message: string = 'Error al enviar email') {
    super(message);
  }
}
