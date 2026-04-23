// Entidad de dominio Usuario
// Representa un usuario del sistema con sus reglas de negocio.
//
// Multi-tenant: `tenantId` es OPCIONAL desde el punto de vista del dominio
// core. Proyectos con el módulo `organizations` lo proveen siempre (enforced
// por `OrganizationContextGuard`). Proyectos core-only lo dejan `null`.
//
// Este módulo NO importa nada de `modules/organizations`: el concepto de
// tenant vive en `shared/domain/tenant` y `organizations` es un *provider*
// de ese contexto.

import { Email } from '../value-objects/Email.vo';
import { TenantId } from '../../../../shared/domain/tenant/TenantId.vo';
import { UserAlreadyActiveException } from '../exceptions/UserAlreadyActiveException';
import { UserAlreadyInactiveException } from '../exceptions/UserAlreadyInactiveException';
import { InvalidUserDataException } from '../exceptions/InvalidUserDataException';

export class User {
  private _name: string;
  private _email: Email;
  private _passwordHash: string;
  private _active: boolean;
  private _roleIds: number[];
  private _failedLoginAttempts: number;
  private _lockedUntil: Date | null;
  private readonly _tenantId: TenantId | null;

  constructor(
    public readonly id: number,
    tenantId: TenantId | null,
    name: string,
    email: Email,
    passwordHash: string,
    active: boolean,
    roleIds: number[],
    failedLoginAttempts: number = 0,
    lockedUntil: Date | null = null,
  ) {
    this._tenantId = tenantId;
    this._name = name;
    this._email = email;
    this._passwordHash = passwordHash;
    this._active = active;
    this._roleIds = roleIds;
    this._failedLoginAttempts = failedLoginAttempts;
    this._lockedUntil = lockedUntil;
  }

  get name(): string { return this._name; }
  get email(): Email { return this._email; }
  get passwordHash(): string { return this._passwordHash; }
  get active(): boolean { return this._active; }
  get roleIds(): number[] { return [...this._roleIds]; }
  get failedLoginAttempts(): number { return this._failedLoginAttempts; }
  get lockedUntil(): Date | null { return this._lockedUntil; }
  get tenantId(): TenantId | null { return this._tenantId; }

  // Factory method para crear/rehidratar un usuario.
  // `tenantId` acepta string (UUID), VO tipado, o null (single-tenant).
  static create(
    id: number,
    tenantId: string | TenantId | null,
    name: string,
    email: string,
    passwordHash: string,
    active: boolean = true,
    roleIds: number[] = [],
    failedLoginAttempts: number = 0,
    lockedUntil: Date | null = null,
  ): User {
    let tid: TenantId | null;
    if (tenantId === null || tenantId === undefined) {
      tid = null;
    } else if (tenantId instanceof TenantId) {
      tid = tenantId;
    } else {
      tid = TenantId.create(tenantId);
    }

    return new User(
      id,
      tid,
      name,
      Email.create(email),
      passwordHash,
      active,
      roleIds,
      failedLoginAttempts,
      lockedUntil,
    );
  }

  // Regla de negocio: Activar usuario
  activate(): void {
    if (this._active) {
      throw new UserAlreadyActiveException(this.id);
    }
    this._active = true;
  }

  // Regla de negocio: Desactivar usuario
  deactivate(): void {
    if (!this._active) {
      throw new UserAlreadyInactiveException(this.id);
    }
    this._active = false;
  }

  // Regla de negocio: Actualizar información básica
  updateBasicInfo(name: string, email: string): void {
    if (!name || name.trim().length === 0) {
      throw new InvalidUserDataException('El nombre no puede estar vacío');
    }
    this._name = name;
    this._email = Email.create(email);
  }

  // Regla de negocio: Cambiar contraseña
  updatePassword(newPasswordHash: string): void {
    if (!newPasswordHash || newPasswordHash.length === 0) {
      throw new InvalidUserDataException('El hash de contraseña no puede estar vacío');
    }
    this._passwordHash = newPasswordHash;
  }

  // Regla de negocio: Asignar roles
  assignRoles(roleIds: number[]): void {
    if (!roleIds || roleIds.length === 0) {
      throw new InvalidUserDataException('Debe asignar al menos un rol');
    }
    this._roleIds = [...new Set(roleIds)]; // Eliminar duplicados
  }

  // Regla de negocio: Verificar si tiene un rol específico
  hasRole(roleId: number): boolean {
    return this._roleIds.includes(roleId);
  }

  // Regla de negocio: Verificar si está activo
  isActive(): boolean {
    return this._active;
  }

  // Regla de negocio: Verificar si la cuenta está bloqueada
  isLocked(): boolean {
    if (!this._lockedUntil) return false;
    return this._lockedUntil > new Date();
  }

  // Regla de negocio: Registrar intento de login fallido
  registerFailedLogin(maxAttempts: number, lockDurationMinutes: number): void {
    this._failedLoginAttempts += 1;
    if (this._failedLoginAttempts >= maxAttempts) {
      this._lockedUntil = new Date(Date.now() + lockDurationMinutes * 60 * 1000);
    }
  }

  // Regla de negocio: Resetear intentos tras login exitoso
  resetFailedLoginAttempts(): void {
    this._failedLoginAttempts = 0;
    this._lockedUntil = null;
  }

  /**
   * Regla multi-tenant: verifica pertenencia a un tenant.
   * - Si el usuario no tiene tenant (single-tenant), acepta cualquier contexto.
   * - Si el caller no provee tenant, no hay restricción que validar.
   */
  belongsToTenant(tenantId: TenantId | string | null | undefined): boolean {
    if (!tenantId || !this._tenantId) return true;
    const other = tenantId instanceof TenantId ? tenantId : TenantId.create(tenantId);
    return this._tenantId.equals(other);
  }

  // Convertir a objeto plano para persistencia
  toPrimitives(): {
    id: number;
    tenantId: string | null;
    name: string;
    email: string;
    passwordHash: string;
    active: boolean;
    roleIds: number[];
  } {
    return {
      id: this.id,
      tenantId: this._tenantId?.value ?? null,
      name: this._name,
      email: this._email.value,
      passwordHash: this._passwordHash,
      active: this._active,
      roleIds: [...this._roleIds],
    };
  }
}
