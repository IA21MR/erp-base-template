// Entidad de dominio para código de restablecimiento de contraseña
// Representa un código de 6 dígitos generado para restablecer la contraseña de un usuario

export class PasswordResetCode {
  constructor(
    public readonly id: number,
    public readonly userId: number,
    public readonly code: string,
    public readonly expiresAt: Date,
    public readonly used: boolean,
    public readonly createdAt: Date
  ) {}

  // Factory method para crear un código de restablecimiento
  static create(
    id: number,
    userId: number,
    code: string,
    expiresAt: Date,
    used: boolean,
    createdAt: Date
  ): PasswordResetCode {
    return new PasswordResetCode(id, userId, code, expiresAt, used, createdAt);
  }

  // Regla de negocio: Verificar si el código ha expirado
  isExpired(): boolean {
    return new Date() > this.expiresAt;
  }

  // Regla de negocio: Verificar si el código es válido (no usado y no expirado)
  isValid(): boolean {
    return !this.used && !this.isExpired();
  }

  // Regla de negocio: Verificar si el código coincide
  matchesCode(code: string): boolean {
    return this.code === code;
  }

  // Convertir a objeto plano para persistencia
  toPrimitives(): {
    id: number;
    userId: number;
    code: string;
    expiresAt: Date;
    used: boolean;
    createdAt: Date;
  } {
    return {
      id: this.id,
      userId: this.userId,
      code: this.code,
      expiresAt: this.expiresAt,
      used: this.used,
      createdAt: this.createdAt,
    };
  }
}
