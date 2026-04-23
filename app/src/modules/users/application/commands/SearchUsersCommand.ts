/**
 * Command: Buscar Usuarios
 *
 * Encapsula los parámetros de búsqueda de usuarios.
 * Permite filtrar por query (nombre/email), estado y rol.
 */
export class SearchUsersCommand {
  constructor(
    public readonly query?: string, // Búsqueda en nombre o email
    public readonly active?: boolean, // Filtrar por estado activo/inactivo
    public readonly roleId?: number, // Filtrar por rol específico
    public readonly page?: number, // Número de página
    public readonly perPage?: number, // Elementos por página
    public readonly tenantId?: string | null, // Filtro multi-tenant (opcional)
  ) {}
}
