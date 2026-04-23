import { uuidv7 } from 'uuidv7';
import { Phone } from '../../../../shared/domain/value-objects/Phone.vo';

export class ContactPhone {
  constructor(
    public readonly id: string,
    private _phone: Phone,
    private _label: string | null,
    private _isPrimary: boolean,
  ) {}

  static create(props: { phone: string; label?: string | null; isPrimary?: boolean }): ContactPhone {
    return new ContactPhone(uuidv7(), Phone.create(props.phone), props.label ?? null, props.isPrimary ?? false);
  }

  get phone(): Phone { return this._phone; }
  get label(): string | null { return this._label; }
  get isPrimary(): boolean { return this._isPrimary; }

  update(props: { phone?: string; label?: string | null }): void {
    if (props.phone !== undefined) this._phone = Phone.create(props.phone);
    if (props.label !== undefined) this._label = props.label;
  }
  markPrimary(): void { this._isPrimary = true; }
  unmarkPrimary(): void { this._isPrimary = false; }
}
