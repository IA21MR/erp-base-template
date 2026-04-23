// Command para el caso de uso de cambio de contraseña
// Representa la intención del usuario autenticado de cambiar su contraseña

export class ChangePasswordCommand {
  constructor(
    public readonly userId: number,
    public readonly currentPassword: string,
    public readonly newPassword: string,
    public readonly confirmPassword: string,
  ) {}
}
