// Result del caso de uso de RefreshToken
// Representa los nuevos tokens generados tras rotación

export class RefreshTokenResult {
  constructor(
    public readonly accessToken: string,
    public readonly refreshToken: string,
    public readonly expiresIn: string
  ) {}
}
