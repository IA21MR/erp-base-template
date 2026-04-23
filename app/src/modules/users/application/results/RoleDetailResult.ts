// Result con información detallada del rol incluyendo sus permisos
import { Role } from '../../domain/entities/Role.entity';
import { Permission } from '../../domain/entities/Permission.entity';

export class RoleDetailResult {
  constructor(
    public readonly role: Role,
    public readonly permissions: Permission[]
  ) {}
}
