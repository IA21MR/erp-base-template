// DTO de Response con detalles completos del usuario
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class RoleSimpleDto {
  @ApiProperty({ description: 'ID del rol', example: 1 })
  id: number;

  @ApiProperty({ description: 'Nombre del rol', example: 'Administrador' })
  name: string;
}

export class UserDetailResponseDto {
  @ApiProperty({ description: 'ID del usuario', example: 1 })
  id: number;

  @ApiProperty({ description: 'Nombre del usuario', example: 'Juan Pérez' })
  name: string;

  @ApiProperty({ description: 'Email del usuario', example: 'juan@empresa.cl' })
  email: string;

  @ApiProperty({ description: 'Estado activo del usuario', example: true })
  active: boolean;

  @ApiProperty({ description: 'Roles asignados al usuario', type: [RoleSimpleDto] })
  roles: RoleSimpleDto[];

  @ApiPropertyOptional({ description: 'Fecha de creación', example: '2026-01-20T10:00:00Z' })
  createdAt?: Date;
}
