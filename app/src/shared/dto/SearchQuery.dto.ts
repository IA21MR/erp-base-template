import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from './PaginationQuery.dto';

/**
 * SearchQueryDto — shared/dto
 *
 * DTO base con paginación + campo `searchTerm` reutilizable.
 * Soporta búsqueda por nombre, código único y código de barras.
 * Cada módulo extiende esta clase y agrega sus propios filtros.
 */
export class SearchQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Término de búsqueda (nombre, código único o código de barras)',
    example: '00100000001',
  })
  @IsOptional()
  @IsString({ message: 'El término de búsqueda debe ser texto' })
  searchTerm?: string;
}
