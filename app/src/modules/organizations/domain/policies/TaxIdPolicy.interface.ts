/**
 * TaxIdPolicy — port de validación de identificadores fiscales por país.
 *
 * El VO `TaxId` solo valida formato genérico. La validación específica (RUT chileno,
 * CUIT argentino, RFC mexicano, etc.) se delega aquí para permitir extensión sin tocar dominio.
 */
import { Result } from '../../../../shared/domain/Result';
import { TaxId } from '../../../../shared/domain/value-objects/TaxId.vo';

export class TaxIdValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TaxIdValidationError';
  }
}

export interface TaxIdPolicy {
  validate(taxId: TaxId): Result<void, TaxIdValidationError>;
}

export interface TaxIdPolicyRegistry {
  register(countryCode: string, policy: TaxIdPolicy): void;
  resolve(countryCode: string): TaxIdPolicy;
}

export const TAX_ID_POLICY_REGISTRY = Symbol('TAX_ID_POLICY_REGISTRY');
