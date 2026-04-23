// Result del caso de uso de Login
// Representa el resultado de la autenticación

export class LoginResult {
  constructor(
    public readonly accessToken: string,
    public readonly refreshToken: string,
    public readonly expiresIn: string,
    public readonly userId: number,
    public readonly email: string,
    public readonly permissions: string[]
  ) {}
}
