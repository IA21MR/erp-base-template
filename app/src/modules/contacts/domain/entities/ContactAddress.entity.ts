import { uuidv7 } from 'uuidv7';
import { Address } from '../../../../shared/domain/value-objects/Address.vo';

export class ContactAddress {
  constructor(
    public readonly id: string,
    private _address: Address,
    private _label: string | null,
    private _isPrimary: boolean,
  ) {}

  static create(props: { address: Address; label?: string | null; isPrimary?: boolean }): ContactAddress {
    return new ContactAddress(uuidv7(), props.address, props.label ?? null, props.isPrimary ?? false);
  }

  get address(): Address { return this._address; }
  get label(): string | null { return this._label; }
  get isPrimary(): boolean { return this._isPrimary; }

  update(props: { address?: Address; label?: string | null }): void {
    if (props.address !== undefined) this._address = props.address;
    if (props.label !== undefined) this._label = props.label;
  }
  markPrimary(): void { this._isPrimary = true; }
  unmarkPrimary(): void { this._isPrimary = false; }
}
