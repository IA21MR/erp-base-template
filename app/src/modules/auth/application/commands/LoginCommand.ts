// Command para el caso de uso de Login
// Representa la intención del usuario de autenticarse

export class LoginCommand {
  constructor(
    public readonly email: string,
    public readonly password: string
  ) {}
}
