// Mapper para transformar entre capas de Role
import { Role } from '../../domain/entities/Role.entity';
import { Permission } from '../../domain/entities/Permission.entity';
import { RoleResponseDto } from '../../interfaces/http/dto/response/RoleResponse.dto';

export class RoleMapper {
  static toResponseDto(role: Role, permissions: Permission[]): RoleResponseDto {
    const permissionsMap = new Map(permissions.map((p) => [p.id, p]));

    return {
      id: role.id,
      name: role.name,
      permissions: role.permissionIds.map((id) => {
        const permission = permissionsMap.get(id);
        return {
          id,
          code: permission?.code ?? '',
          description: permission?.description ?? '',
        };
      }),
    };
  }

  static toResponseDtoArray(roles: Role[], permissions: Permission[]): RoleResponseDto[] {
    return roles.map((r) => this.toResponseDto(r, permissions));
  }
}
