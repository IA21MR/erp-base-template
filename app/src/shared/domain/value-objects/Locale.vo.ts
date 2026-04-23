/**
 * Value Object: Locale
 * BCP-47 simplificado. Ej: es-CL, en-US, pt-BR.
 */
export class Locale {
  private constructor(public readonly value: string) {
    if (!value || !/^[a-z]{2}(-[A-Z]{2})?$/.test(value)) {
      throw new Error('Locale debe cumplir BCP-47 simplificado (ej: es-CL, en-US)');
    }
  }

  static create(value: string): Locale {
    const parts = value.trim().split('-');
    const normalized = parts.length === 2
      ? `${parts[0].toLowerCase()}-${parts[1].toUpperCase()}`
      : parts[0].toLowerCase();
    return new Locale(normalized);
  }

  equals(other: Locale): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
