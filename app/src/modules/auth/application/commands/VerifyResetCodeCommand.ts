// Command para el caso de uso de verificación de código de restablecimiento
// Representa la intención del usuario de verificar el código recibido por email

export class VerifyResetCodeCommand {
  constructor(
    public readonly email: string,
    public readonly code: string
  ) {}
}
