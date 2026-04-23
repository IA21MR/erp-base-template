// Result con información del rol
import { Role } from '../../domain/entities/Role.entity';

export class RoleResult {
  constructor(public readonly role: Role) {}
}
