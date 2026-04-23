// DTO de Response para búsqueda de usuarios
import { ApiProperty } from '@nestjs/swagger';

class RoleSimpleDto {
  @ApiProperty({ description: 'ID del rol', example: 1 })
  id: number;

  @ApiProperty({ description: 'Nombre del rol', example: 'Administrador' })
  name: string;
}

class UserSearchItemDto {
  @ApiProperty({ description: 'ID del usuario', example: 1 })
  id: number;

  @ApiProperty({ description: 'Nombre del usuario', example: 'Juan Pérez' })
  name: string;

  @ApiProperty({ description: 'Email del usuario', example: 'juan@empresa.cl' })
  email: string;

  @ApiProperty({ description: 'Estado activo del usuario', example: true })
  active: boolean;

  @ApiProperty({ description: 'Roles asignados', type: [RoleSimpleDto] })
  roles: RoleSimpleDto[];
}

export class SearchUsersResponseDto {
  @ApiProperty({ description: 'Mensaje de respuesta', example: 'Usuarios encontrados' })
  message: string;

  @ApiProperty({ description: 'Lista de usuarios encontrados', type: [UserSearchItemDto] })
  data: UserSearchItemDto[];

  @ApiProperty({ description: 'Total de resultados', example: 5 })
  total: number;
}
