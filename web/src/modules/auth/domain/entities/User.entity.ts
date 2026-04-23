/**
 * Entidad de dominio: Usuario
 * Representa un usuario autenticado en el sistema
 */
export interface User {
  id: number;
  email: string;
  name: string;
  role: string;
  isActive: boolean;
  permissions: string[];
}
