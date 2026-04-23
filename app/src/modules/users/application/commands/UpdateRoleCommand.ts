// Command para actualizar un rol
export class UpdateRoleCommand {
  constructor(
    public readonly name?: string,
    public readonly permissionIds?: number[]
  ) {}
}
