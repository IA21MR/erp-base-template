// Entidad de dominio Usuario
// Representa un usuario del sistema con sus reglas de negocio.
// Invariante multi-tenant: todo usuario pertenece a exactamente una organización.

import { Email } from '../value-objects/Email.vo';
import { OrganizationId } from '../../../organizations/domain/value-objects/OrganizationId.vo';
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
  private readonly _organizationId: OrganizationId;

  constructor(
    public readonly id: number,
    organizationId: OrganizationId,
    name: string,
    email: Email,
    passwordHash: string,
    active: boolean,
    roleIds: number[],
    failedLoginAttempts: number = 0,
    lockedUntil: Date | null = null,
  ) {
    // Invariante multi-tenant: organizationId es obligatorio.
    if (!organizationId) {
      throw new InvalidUserDataException('El usuario debe pertenecer a una organización');
    }
    this._organizationId = organizationId;
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
  get organizationId(): OrganizationId { return this._organizationId; }

  // Factory method para crear/rehidratar un usuario.
  // `organizationId` acepta string (UUID) o el VO tipado.
  static create(
    id: number,
    organizationId: string | OrganizationId,
    name: string,
    email: string,
    passwordHash: string,
    active: boolean = true,
    roleIds: number[] = [],
    failedLoginAttempts: number = 0,
    lockedUntil: Date | null = null,
  ): User {
    const orgId =
      organizationId instanceof OrganizationId
        ? organizationId
        : OrganizationId.create(organizationId);

    return new User(
      id,
      orgId,
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

  // Regla multi-tenant: verificar pertenencia a una organización
  belongsToOrganization(organizationId: OrganizationId | string): boolean {
    const other =
      organizationId instanceof OrganizationId
        ? organizationId
        : OrganizationId.create(organizationId);
    return this._organizationId.equals(other);
  }

  // Convertir a objeto plano para persistencia
  toPrimitives(): {
    id: number;
    organizationId: string;
    name: string;
    email: string;
    passwordHash: string;
    active: boolean;
    roleIds: number[];
  } {
    return {
      id: this.id,
      organizationId: this._organizationId.value,
      name: this._name,
      email: this._email.value,
      passwordHash: this._passwordHash,
      active: this._active,
      roleIds: [...this._roleIds],
    };
  }
}
