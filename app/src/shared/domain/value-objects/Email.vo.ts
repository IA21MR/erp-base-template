/**
 * Value Object: Email (shared)
 *
 * Movido desde modules/users para ser reutilizado por Contacts y Organizations.
 * El VO original en users/ re-exporta desde aquí.
 */
export class Email {
  private constructor(public readonly value: string) {
    this.validate(value);
  }

  static create(value: string): Email {
    return new Email(value);
  }

  private validate(value: string): void {
    if (!value || value.trim().length === 0) {
      throw new Error('El email no puede estar vacío');
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      throw new Error('El formato del email no es válido');
    }
    if (value.length > 255) {
      throw new Error('El email no puede tener más de 255 caracteres');
    }
  }

  equals(other: Email): boolean {
    return this.value.toLowerCase() === other.value.toLowerCase();
  }

  toString(): string {
    return this.value;
  }
}
