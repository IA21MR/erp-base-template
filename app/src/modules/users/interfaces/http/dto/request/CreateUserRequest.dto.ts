// DTO de Request para crear un usuario
import {
  IsString,
  IsEmail,
  IsArray,
  IsNotEmpty,
  MinLength,
  ArrayMinSize,
  IsNumber,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserRequestDto {
  @ApiProperty({
    description: 'Nombre completo del usuario',
    example: 'Juan Pérez',
  })
  @IsString()
  @IsNotEmpty({ message: 'El nombre es requerido' })
  name: string;

  @ApiProperty({
    description: 'Email del usuario (debe ser único)',
    example: 'juan.perez@empresa.cl',
  })
  @IsEmail({}, { message: 'El email debe ser válido' })
  @IsNotEmpty({ message: 'El email es requerido' })
  email: string;

  @ApiProperty({
    description: 'Contraseña (mínimo 8 caracteres, debe incluir letra y número)',
    example: 'Password123',
    minLength: 8,
  })
  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @IsNotEmpty({ message: 'La contraseña es requerida' })
  password: string;

  @ApiProperty({
    description: 'IDs de los roles a asignar',
    example: [1, 2],
    type: [Number],
  })
  @IsArray({ message: 'Los roles deben ser un arreglo' })
  @ArrayMinSize(1, { message: 'Debe asignar al menos un rol' })
  @IsNumber({}, { each: true, message: 'Cada rol debe ser un número' })
  roleIds: number[];
}
