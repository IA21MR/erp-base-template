// Puerto (Interface) del repositorio de Rol
// Define el contrato que debe implementar la capa de infraestructura

import { Role } from '../entities/Role.entity';

export interface RoleRepository {
  // Crear un nuevo rol
  create(role: Role): Promise<Role>;

  // Buscar rol por ID
  findById(id: number): Promise<Role | null>;

  // Buscar roles por múltiples IDs
  findByIds(ids: number[]): Promise<Role[]>;

  // Buscar rol por nombre
  findByName(name: string): Promise<Role | null>;

  // Buscar todos los roles
  findAll(): Promise<Role[]>;

  // Listar roles con paginación
  listPaginated(page: number, perPage: number): Promise<{
    items: Role[];
    total: number;
  }>;

  // Actualizar rol
  update(role: Role): Promise<Role>;

  // Eliminar rol
  delete(id: number): Promise<void>;

  // Verificar si existe un rol con ese nombre
  existsByName(name: string): Promise<boolean>;

  // Verificar si un rol está asignado a algún usuario
  isAssignedToUser(roleId: number): Promise<boolean>;

  // Asignar permisos a un rol
  assignPermissions(roleId: number, permissionIds: number[]): Promise<void>;

  // Remover permisos de un rol
  removePermissions(roleId: number, permissionIds: number[]): Promise<void>;

  // Obtener permisos de un rol
  getRolePermissions(roleId: number): Promise<number[]>;

  // Verificar si existe un rol con el mismo nombre y permisos
  existsByNameAndPermissions(
    name: string,
    permissionIds: number[]
  ): Promise<boolean>;
}
