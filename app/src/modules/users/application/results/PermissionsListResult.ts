// Result con lista de permisos
import { Permission } from '../../domain/entities/Permission.entity';

export class PermissionsListResult {
  constructor(public readonly permissions: Permission[]) {}
}
