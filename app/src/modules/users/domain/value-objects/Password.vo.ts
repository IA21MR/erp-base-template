// Value Object: Password
// Representa una contraseña con sus reglas de validación

export class Password {
  private constructor(public readonly value: string) {
    this.validate(value);
  }

  // Factory method para crear una contraseña
  static create(value: string): Password {
    return new Password(value);
  }

  // Regla de negocio: Validar contraseña
  private validate(value: string): void {
    if (!value || value.trim().length === 0) {
      throw new Error('La contraseña no puede estar vacía');
    }

    if (value.length < 8) {
      throw new Error('La contraseña debe tener al menos 8 caracteres');
    }

    if (value.length > 100) {
      throw new Error('La contraseña no puede tener más de 100 caracteres');
    }

    // Validar que contenga al menos una letra
    if (!/[a-zA-Z]/.test(value)) {
      throw new Error('La contraseña debe contener al menos una letra');
    }

    // Validar que contenga al menos un número
    if (!/[0-9]/.test(value)) {
      throw new Error('La contraseña debe contener al menos un número');
    }
  }

  // Convertir a string (para hashear)
  toString(): string {
    return this.value;
  }
}
