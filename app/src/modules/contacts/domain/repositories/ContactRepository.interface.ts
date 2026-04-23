import { Contact } from '../entities/Contact.entity';
import { ContactId } from '../value-objects/ContactId.vo';
import { PrismaTransactionClient } from '../../../../shared/database/transaction-manager';

export interface ContactListFilters {
  organizationId?: string;
  type?: 'PERSON' | 'COMPANY';
  active?: boolean;
  roleTypeId?: string;
  assignedToUserId?: number;
  query?: string;
}

export interface ContactRepository {
  findById(id: ContactId | string): Promise<Contact | null>;
  findByTaxId(
    organizationId: string,
    countryCode: string,
    taxId: string,
  ): Promise<Contact | null>;

  list(
    filters: ContactListFilters,
    page: number,
    perPage: number,
  ): Promise<{ items: Contact[]; total: number }>;

  search(
    query: string,
    page: number,
    perPage: number,
  ): Promise<{ items: Contact[]; total: number }>;

  save(contact: Contact, tx?: PrismaTransactionClient): Promise<void>;
}
