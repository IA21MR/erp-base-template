import { uuidv7 } from 'uuidv7';
import { Email } from '../../../../shared/domain/value-objects/Email.vo';

export class ContactEmail {
  constructor(
    public readonly id: string,
    private _email: Email,
    private _label: string | null,
    private _isPrimary: boolean,
  ) {}

  static create(props: { email: string; label?: string | null; isPrimary?: boolean }): ContactEmail {
    return new ContactEmail(uuidv7(), Email.create(props.email), props.label ?? null, props.isPrimary ?? false);
  }

  get email(): Email { return this._email; }
  get label(): string | null { return this._label; }
  get isPrimary(): boolean { return this._isPrimary; }

  update(props: { email?: string; label?: string | null }): void {
    if (props.email !== undefined) this._email = Email.create(props.email);
    if (props.label !== undefined) this._label = props.label;
  }
  markPrimary(): void { this._isPrimary = true; }
  unmarkPrimary(): void { this._isPrimary = false; }
}
