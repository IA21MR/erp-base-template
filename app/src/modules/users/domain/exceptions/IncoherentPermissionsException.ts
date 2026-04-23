import { DomainException } from '../../../../shared/domain/DomainException';

/**
 * Excepción de dominio: Permisos incoherentes
 *
 * Se lanza cuando se intenta crear/actualizar un rol con permisos de acción
 * sin sus permisos base de lectura correspondientes.
 */
export class IncoherentPermissionsException extends DomainException {
  public readonly violations: string[];

  constructor(violations: string[]) {
    super(
      `Permisos incoherentes: ${violations.join('; ')}`,
    );
    this.violations = violations;
  }
}
