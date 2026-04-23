// Puerto (Interface) del repositorio de Permiso
// Define el contrato que debe implementar la capa de infraestructura

import { Permission } from '../entities/Permission.entity';

export interface PermissionRepository {
  // Buscar permiso por ID
  findById(id: number): Promise<Permission | null>;

  // Buscar permiso por código
  findByCode(code: string): Promise<Permission | null>;

  // Buscar múltiples permisos por IDs
  findByIds(ids: number[]): Promise<Permission[]>;

  // Buscar múltiples permisos por códigos
  findByCodes(codes: string[]): Promise<Permission[]>;

  // Buscar todos los permisos
  findAll(): Promise<Permission[]>;

  // Verificar si existe un permiso con ese código
  existsByCode(code: string): Promise<boolean>;
}
