// DTO de Request para crear un rol
import { IsString, IsArray, IsNotEmpty, ArrayMinSize, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRoleRequestDto {
  @ApiProperty({
    description: 'Nombre del rol',
    example: 'Administrador',
  })
  @IsString()
  @IsNotEmpty({ message: 'El nombre del rol es requerido' })
  name: string;

  @ApiProperty({
    description: 'IDs de los permisos a asignar al rol',
    example: [1, 2, 3],
    type: [Number],
  })
  @IsArray({ message: 'Los permisos deben ser un arreglo' })
  @ArrayMinSize(1, { message: 'Debe asignar al menos un permiso' })
  @IsNumber({}, { each: true, message: 'Cada permiso debe ser un número' })
  permissionIds: number[];
}
