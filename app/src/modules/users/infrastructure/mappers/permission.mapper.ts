// Mapper para transformar entre capas de Permission
import { Permission } from '../../domain/entities/Permission.entity';
import { PermissionResponseDto } from '../../interfaces/http/dto/response/PermissionResponse.dto';

export class PermissionMapper {
  static toResponseDto(permission: Permission): PermissionResponseDto {
    return {
      id: permission.id,
      code: permission.code,
      description: permission.description || '',
    };
  }

  static toResponseDtoArray(
    permissions: Permission[]
  ): PermissionResponseDto[] {
    return permissions.map((p) => this.toResponseDto(p));
  }
}
