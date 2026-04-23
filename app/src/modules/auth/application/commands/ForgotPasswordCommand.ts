// Command para el caso de uso de solicitud de restablecimiento de contraseña
// Representa la intención del usuario de solicitar restablecer su contraseña

export class ForgotPasswordCommand {
  constructor(public readonly email: string) {}
}
