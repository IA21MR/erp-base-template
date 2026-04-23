/**
 * Value Object: Address
 *
 * Dirección postal estructurada. Inmutable — se reemplaza completa al modificar.
 */
import { CountryCode } from './CountryCode.vo';

export interface AddressProps {
  street: string;
  city: string;
  region?: string | null;
  postalCode?: string | null;
  countryCode: CountryCode;
}

export class Address {
  private constructor(private readonly props: AddressProps) {
    if (!props.street || props.street.trim().length === 0) {
      throw new Error('Address.street no puede estar vacío');
    }
    if (!props.city || props.city.trim().length === 0) {
      throw new Error('Address.city no puede estar vacío');
    }
    if (props.street.length > 255) {
      throw new Error('Address.street no puede superar 255 caracteres');
    }
  }

  static create(props: {
    street: string;
    city: string;
    region?: string | null;
    postalCode?: string | null;
    countryCode: string | CountryCode;
  }): Address {
    return new Address({
      street: props.street.trim(),
      city: props.city.trim(),
      region: props.region?.trim() || null,
      postalCode: props.postalCode?.trim() || null,
      countryCode:
        typeof props.countryCode === 'string'
          ? CountryCode.create(props.countryCode)
          : props.countryCode,
    });
  }

  get street(): string { return this.props.street; }
  get city(): string { return this.props.city; }
  get region(): string | null { return this.props.region ?? null; }
  get postalCode(): string | null { return this.props.postalCode ?? null; }
  get countryCode(): CountryCode { return this.props.countryCode; }

  equals(other: Address): boolean {
    return (
      this.street === other.street &&
      this.city === other.city &&
      this.region === other.region &&
      this.postalCode === other.postalCode &&
      this.countryCode.equals(other.countryCode)
    );
  }
}
