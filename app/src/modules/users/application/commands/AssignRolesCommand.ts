// Command para asignar roles a un usuario
export class AssignRolesCommand {
  constructor(
    public readonly userId: number,
    public readonly roleIds: number[]
  ) {}
}
