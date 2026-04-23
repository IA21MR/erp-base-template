// Entidad de dominio Rol
// Representa un rol del sistema con sus permisos asociados

export class Role {
  constructor(
    public readonly id: number,
    public name: string,
    public permissionIds: number[]
  ) {}

  // Factory method para crear un nuevo rol
  static create(id: number, name: string, permissionIds: number[] = []): Role {
    return new Role(id, name, permissionIds);
  }

  // Regla de negocio: Actualizar nombre del rol
  updateName(newName: string): void {
    if (!newName || newName.trim().length === 0) {
      throw new Error('El nombre del rol no puede estar vacío');
    }
    this.name = newName.trim();
  }

  // Regla de negocio: Asignar permisos al rol
  assignPermissions(permissionIds: number[]): void {
    if (!permissionIds || permissionIds.length === 0) {
      throw new Error('Debe asignar al menos un permiso al rol');
    }
    this.permissionIds = [...new Set(permissionIds)]; // Eliminar duplicados
  }

  // Regla de negocio: Agregar un permiso
  addPermission(permissionId: number): void {
    if (this.hasPermission(permissionId)) {
      throw new Error('El rol ya tiene este permiso');
    }
    this.permissionIds.push(permissionId);
  }

  // Regla de negocio: Remover un permiso
  removePermission(permissionId: number): void {
    if (!this.hasPermission(permissionId)) {
      throw new Error('El rol no tiene este permiso');
    }
    this.permissionIds = this.permissionIds.filter((id) => id !== permissionId);
  }

  // Regla de negocio: Verificar si tiene un permiso específico
  hasPermission(permissionId: number): boolean {
    return this.permissionIds.includes(permissionId);
  }

  // Regla de negocio: Verificar si tiene todos los permisos requeridos
  hasAllPermissions(requiredPermissionIds: number[]): boolean {
    return requiredPermissionIds.every((id) => this.hasPermission(id));
  }

  // Regla de negocio: Verificar si tiene al menos uno de los permisos
  hasAnyPermission(permissionIds: number[]): boolean {
    return permissionIds.some((id) => this.hasPermission(id));
  }

  // Convertir a objeto plano para persistencia
  toPrimitives(): {
    id: number;
    name: string;
    permissionIds: number[];
  } {
    return {
      id: this.id,
      name: this.name,
      permissionIds: this.permissionIds,
    };
  }
}
