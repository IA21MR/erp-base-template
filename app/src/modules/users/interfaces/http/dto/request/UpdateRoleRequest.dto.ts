// DTO de Request para actualizar un rol
import { IsString, IsArray, IsOptional, ArrayMinSize, IsNumber } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateRoleRequestDto {
  @ApiPropertyOptional({
    description: 'Nuevo nombre del rol',
    example: 'Supervisor',
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    description: 'IDs de los permisos a asignar al rol',
    example: [1, 2, 3, 4],
    type: [Number],
  })
  @IsArray({ message: 'Los permisos deben ser un arreglo' })
  @ArrayMinSize(1, { message: 'Debe asignar al menos un permiso' })
  @IsNumber({}, { each: true, message: 'Cada permiso debe ser un número' })
  @IsOptional()
  permissionIds?: number[];
}
