/**
 * Puerto: OrganizationRepository — único port de mutación del aggregate.
 *
 * El `save` acepta un cliente transaccional opcional para componer con outbox
 * en la misma `$transaction`.
 */
import { Organization } from '../entities/Organization.entity';
import { OrganizationId } from '../value-objects/OrganizationId.vo';
import { PrismaTransactionClient } from '../../../../shared/database/transaction-manager';

export interface OrganizationListFilters {
  active?: boolean;
  isPrimary?: boolean;
  countryCode?: string;
  query?: string;
}

export interface OrganizationRepository {
  findById(id: OrganizationId | string): Promise<Organization | null>;
  findByTaxId(taxId: string, countryCode: string): Promise<Organization | null>;
  findPrimary(): Promise<Organization | null>;

  list(
    filters: OrganizationListFilters,
    page: number,
    perPage: number,
  ): Promise<{ items: Organization[]; total: number }>;

  search(
    query: string,
    page: number,
    perPage: number,
  ): Promise<{ items: Organization[]; total: number }>;

  /**
   * Persiste root + settings (4 tablas) + addresses en la misma transacción.
   * Si se pasa `tx`, usa ese cliente (para componerse con outbox).
   */
  save(org: Organization, tx?: PrismaTransactionClient): Promise<void>;

  /**
   * Limpia el flag `is_primary` de todas las organizaciones excepto la indicada.
   * Llamado desde el use case de `SetPrimaryOrganization` dentro de la misma TX.
   */
  clearPrimaryFlag(exceptId: OrganizationId | string, tx?: PrismaTransactionClient): Promise<void>;
}
