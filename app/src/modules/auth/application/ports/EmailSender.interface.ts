// Puerto (Interface) para el envío de emails
// Abstrae el servicio de envío de correos electrónicos

export interface EmailSender {
  /**
   * Envía un email con el código de restablecimiento de contraseña
   * @param email - Email del destinatario
   * @param code - Código de 6 dígitos
   * @returns Promise<void>
   */
  sendPasswordResetCode(email: string, code: string): Promise<void>;
}
