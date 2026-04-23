/**
 * Value Object: TaxId
 *
 * Identificador fiscal (RUT/NIF/CUIT/RFC...). NO valida formato específico por país,
 * solo longitud (3–30) y charset básico (alfanumérico + guiones/puntos). La validación
 * por país se delega a `TaxIdPolicy` (port inyectable por módulo).
 */
import { CountryCode } from './CountryCode.vo';

export class TaxId {
  private constructor(
    public readonly value: string,
    public readonly countryCode: CountryCode,
  ) {
    const normalized = value;
    if (!normalized || !/^[A-Z0-9.\-]{3,30}$/i.test(normalized)) {
      throw new Error('TaxId debe tener 3–30 caracteres alfanuméricos (con . o -)');
    }
  }

  static create(value: string, countryCode: CountryCode | string): TaxId {
    const cc = typeof countryCode === 'string' ? CountryCode.create(countryCode) : countryCode;
    const normalized = value.trim().toUpperCase();
    return new TaxId(normalized, cc);
  }

  equals(other: TaxId): boolean {
    return this.value === other.value && this.countryCode.equals(other.countryCode);
  }

  toString(): string {
    return `${this.countryCode.value}:${this.value}`;
  }
}
