// Entidad de dominio para refresh token
// Representa un token de refresco para mantener la sesión del usuario

export class RefreshToken {
  constructor(
    public readonly id: number,
    public readonly userId: number,
    public readonly token: string,
    public readonly expiresAt: Date,
    public readonly createdAt: Date
  ) {}

  // Factory method para crear un refresh token
  static create(
    id: number,
    userId: number,
    token: string,
    expiresAt: Date,
    createdAt: Date
  ): RefreshToken {
    return new RefreshToken(id, userId, token, expiresAt, createdAt);
  }

  // Regla de negocio: Verificar si el token ha expirado
  isExpired(): boolean {
    return new Date() > this.expiresAt;
  }

  // Regla de negocio: Verificar si el token es válido (no expirado)
  isValid(): boolean {
    return !this.isExpired();
  }

  // Regla de negocio: Verificar si el token coincide
  matchesToken(token: string): boolean {
    return this.token === token;
  }

  // Convertir a objeto plano para persistencia
  toPrimitives(): {
    id: number;
    userId: number;
    token: string;
    expiresAt: Date;
    createdAt: Date;
  } {
    return {
      id: this.id,
      userId: this.userId,
      token: this.token,
      expiresAt: this.expiresAt,
      createdAt: this.createdAt,
    };
  }
}
