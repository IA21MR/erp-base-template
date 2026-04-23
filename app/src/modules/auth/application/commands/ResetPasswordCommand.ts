// Command para el caso de uso de restablecimiento de contraseña
// Representa la intención del usuario de cambiar su contraseña usando el código

export class ResetPasswordCommand {
  constructor(
    public readonly email: string,
    public readonly code: string,
    public readonly newPassword: string,
    public readonly confirmPassword: string
  ) {}
}
