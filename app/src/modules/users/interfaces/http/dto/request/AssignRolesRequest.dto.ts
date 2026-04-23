// DTO de Request para asignar roles a un usuario
import { IsArray, ArrayMinSize, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignRolesRequestDto {
  @ApiProperty({
    description: 'IDs de los roles a asignar al usuario',
    example: [1, 2],
    type: [Number],
  })
  @IsArray({ message: 'Los roles deben ser un arreglo' })
  @ArrayMinSize(1, { message: 'Debe asignar al menos un rol' })
  @IsNumber({}, { each: true, message: 'Cada rol debe ser un número' })
  roleIds: number[];
}
