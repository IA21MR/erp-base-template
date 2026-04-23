// Command para el caso de uso de RefreshToken
// Representa la intención del usuario de refrescar su token de acceso

export class RefreshTokenCommand {
  constructor(public readonly refreshToken: string) {}
}
