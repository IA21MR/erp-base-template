/**
 * DefaultTaxIdPolicyRegistry
 *
 * Implementación default que acepta cualquier TaxId con formato genérico.
 * Países específicos (CL, AR, MX, ...) pueden registrar políticas propias
 * llamando a `register(countryCode, policy)` al bootstrap.
 */
import { Injectable } from '@nestjs/common';
import { Result } from '../../../../shared/domain/Result';
import { TaxId } from '../../../../shared/domain/value-objects/TaxId.vo';
import {
  TaxIdPolicy,
  TaxIdPolicyRegistry,
  TaxIdValidationError,
} from '../../domain/policies/TaxIdPolicy.interface';

class PassThroughPolicy implements TaxIdPolicy {
  validate(_taxId: TaxId): Result<void, TaxIdValidationError> {
    return Result.ok(undefined);
  }
}

@Injectable()
export class DefaultTaxIdPolicyRegistry implements TaxIdPolicyRegistry {
  private readonly policies = new Map<string, TaxIdPolicy>();
  private readonly fallback: TaxIdPolicy = new PassThroughPolicy();

  register(countryCode: string, policy: TaxIdPolicy): void {
    this.policies.set(countryCode.toUpperCase(), policy);
  }

  resolve(countryCode: string): TaxIdPolicy {
    return this.policies.get(countryCode.toUpperCase()) ?? this.fallback;
  }
}
