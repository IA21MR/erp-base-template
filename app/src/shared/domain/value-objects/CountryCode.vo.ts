/**
 * Value Object: CountryCode
 *
 * ISO-3166-1 alpha-2 (2 letras, mayúsculas). Ej: CL, AR, MX, US.
 * No valida contra la lista oficial completa (evitar dependencia pesada);
 * solo formato. Validación contra catálogo queda para un policy inyectable.
 */
export class CountryCode {
  private constructor(public readonly value: string) {
    if (!value || !/^[A-Z]{2}$/.test(value)) {
      throw new Error('CountryCode debe ser ISO-3166-1 alpha-2 (2 letras mayúsculas)');
    }
  }

  static create(value: string): CountryCode {
    return new CountryCode(value.trim().toUpperCase());
  }

  equals(other: CountryCode): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
