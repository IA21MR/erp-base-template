/**
 * Value Object: Phone
 * Formato E.164 simplificado: + seguido de 8–15 dígitos.
 */
export class Phone {
  private constructor(public readonly value: string) {
    if (!value || !/^\+[1-9]\d{7,14}$/.test(value)) {
      throw new Error('Phone debe ser E.164 (ej: +56912345678)');
    }
  }

  static create(value: string): Phone {
    const cleaned = value.replace(/[\s\-()]/g, '');
    return new Phone(cleaned);
  }

  equals(other: Phone): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
