/**
 * ContactRoleType — catálogo (seed-only). Los consumidores sólo lo leen.
 */
export class ContactRoleType {
  constructor(
    public readonly id: string,
    public readonly code: string,
    public readonly label: string,
    public readonly isSystem: boolean,
  ) {}
}
