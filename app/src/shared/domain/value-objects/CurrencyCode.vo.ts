/**
 * Value Object: CurrencyCode
 * ISO-4217 (3 letras). Ej: CLP, USD, EUR, ARS.
 */
export class CurrencyCode {
  private constructor(public readonly value: string) {
    if (!value || !/^[A-Z]{3}$/.test(value)) {
      throw new Error('CurrencyCode debe ser ISO-4217 (3 letras mayúsculas)');
    }
  }

  static create(value: string): CurrencyCode {
    return new CurrencyCode(value.trim().toUpperCase());
  }

  equals(other: CurrencyCode): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
