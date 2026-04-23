// Command para el caso de uso de Logout
// Representa la intención del usuario de cerrar sesión

export class LogoutCommand {
  constructor(public readonly userId: number) {}
}
