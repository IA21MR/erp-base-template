// Puerto (Interface) del repositorio de Usuario
// Define el contrato que debe implementar la capa de infraestructura

import { User } from '../entities/User.entity';

export interface UserRepository {
  // Crear un nuevo usuario
  create(user: User): Promise<User>;

  // Buscar usuario por ID
  findById(id: number): Promise<User | null>;

  // Buscar usuario por email
  findByEmail(email: string): Promise<User | null>;

  // Buscar todos los usuarios
  findAll(): Promise<User[]>;

  // Listar usuarios con paginación (opcionalmente filtrados por organización — multi-tenant)
  listPaginated(page: number, perPage: number, organizationId?: string): Promise<{
    items: User[];
    total: number;
  }>;

  // Buscar usuarios con filtros (búsqueda)
  search(
    query?: string, // Buscar en nombre o email
    active?: boolean, // Filtrar por estado
    roleId?: number, // Filtrar por rol
    page?: number, // Número de página
    perPage?: number, // Elementos por página
    organizationId?: string, // Filtro multi-tenant (opcional)
  ): Promise<{
    items: User[];
    total: number;
  }>;

  // Actualizar usuario
  update(user: User): Promise<User>;

  // Verificar si existe un usuario con ese email
  existsByEmail(email: string): Promise<boolean>;

  // Asignar roles a un usuario
  assignRoles(userId: number, roleIds: number[]): Promise<void>;

  // Remover roles de un usuario
  removeRoles(userId: number, roleIds: number[]): Promise<void>;

  // Obtener roles de un usuario
  getUserRoles(userId: number): Promise<number[]>;

  // Actualizar campos de intentos de login (bloqueo de cuenta)
  updateLoginAttempts(
    userId: number,
    failedLoginAttempts: number,
    lockedUntil: Date | null,
  ): Promise<void>;
}
