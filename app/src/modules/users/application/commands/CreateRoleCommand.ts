// Command para crear un rol
export class CreateRoleCommand {
  constructor(
    public readonly name: string,
    public readonly permissionIds: number[]
  ) {}
}
