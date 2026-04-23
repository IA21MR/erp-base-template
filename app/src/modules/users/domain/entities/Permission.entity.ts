// Entidad de dominio Permiso
// Representa un permiso del sistema

export class Permission {
  constructor(
    public readonly id: number,
    public readonly code: string,
    public description: string | null
  ) {}

  // Factory method para crear un nuevo permiso
  static create(id: number, code: string, description: string | null): Permission {
    return new Permission(id, code, description);
  }

  // Regla de negocio: Actualizar descripción del permiso
  updateDescription(newDescription: string): void {
    if (!newDescription || newDescription.trim().length === 0) {
      throw new Error('La descripción del permiso no puede estar vacía');
    }
    this.description = newDescription.trim();
  }

  // Regla de negocio: Verificar si el código coincide
  hasCode(code: string): boolean {
    return this.code === code;
  }

  // Convertir a objeto plano para persistencia
  toPrimitives(): {
    id: number;
    code: string;
    description: string | null;
  } {
    return {
      id: this.id,
      code: this.code,
      description: this.description,
    };
  }
}
