// Result con lista de roles
import { Role } from '../../domain/entities/Role.entity';

export class RolesListResult {
  constructor(public readonly roles: Role[]) {}
}
