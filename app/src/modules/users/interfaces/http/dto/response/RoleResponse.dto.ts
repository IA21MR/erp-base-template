// DTO de Response para rol
import { ApiProperty } from '@nestjs/swagger';

class PermissionSimpleDto {
  @ApiProperty({ description: 'ID del permiso', example: 1 })
  id: number;

  @ApiProperty({ description: 'Código del permiso', example: 'CREATE_USER' })
  code: string;

  @ApiProperty({ description: 'Descripción del permiso', example: 'Crear usuarios' })
  description: string;
}

export class RoleResponseDto {
  @ApiProperty({ description: 'ID del rol', example: 1 })
  id: number;

  @ApiProperty({ description: 'Nombre del rol', example: 'Administrador' })
  name: string;

  @ApiProperty({ description: 'Permisos del rol', type: [PermissionSimpleDto] })
  permissions: PermissionSimpleDto[];
}
