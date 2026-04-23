import { uuidv7 } from 'uuidv7';

/**
 * ContactRole — asignación de un rol (tipo) a un contacto con vigencia opcional.
 */
export class ContactRole {
  constructor(
    public readonly id: string,
    public readonly roleTypeId: string,
    private _since: Date | null,
    private _until: Date | null,
  ) {}

  static create(props: { roleTypeId: string; since?: Date | null; until?: Date | null }): ContactRole {
    return new ContactRole(uuidv7(), props.roleTypeId, props.since ?? null, props.until ?? null);
  }

  get since(): Date | null { return this._since; }
  get until(): Date | null { return this._until; }

  isActive(reference: Date = new Date()): boolean {
    if (this._since && reference < this._since) return false;
    if (this._until && reference > this._until) return false;
    return true;
  }
}
