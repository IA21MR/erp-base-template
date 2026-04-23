/**
 * Entidad hija: OrganizationAddress (parte del aggregate Organization)
 *
 * Representa una dirección fiscal o sucursal. Inmutable excepto por `isPrimary`,
 * que lo gestiona el root al normalizar la colección.
 */
import { uuidv7 } from 'uuidv7';
import { Address } from '../../../../shared/domain/value-objects/Address.vo';

export class OrganizationAddress {
  constructor(
    public readonly id: string,
    public readonly address: Address,
    public readonly label: string | null,
    private _isPrimary: boolean,
  ) {}

  static create(props: {
    id?: string;
    address: Address;
    label?: string | null;
    isPrimary?: boolean;
  }): OrganizationAddress {
    return new OrganizationAddress(
      props.id ?? uuidv7(),
      props.address,
      props.label?.trim() || null,
      props.isPrimary ?? false,
    );
  }

  get isPrimary(): boolean { return this._isPrimary; }

  /** Solo el root debe llamarlo. */
  markPrimary(): void { this._isPrimary = true; }
  unmarkPrimary(): void { this._isPrimary = false; }
}
