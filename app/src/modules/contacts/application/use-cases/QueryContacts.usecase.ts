import { Inject, Injectable } from '@nestjs/common';
import { computeTotalPages } from '../../../../shared/domain/Pagination';
import { CONTACT_REPOSITORY, CONTACT_ROLE_TYPE_REPOSITORY } from '../../Contacts.Tokens';
import type { ContactRepository } from '../../domain/repositories/ContactRepository.interface';
import type { ContactRoleTypeRepository } from '../../domain/repositories/ContactRoleTypeRepository.interface';
import { ContactNotFoundException } from '../../domain/exceptions';
import { ListContactsCommand, SearchContactsCommand } from '../commands';
import {
  ContactResult,
  ContactRoleTypeResult,
  toContactResult,
  toContactRoleTypeResult,
} from '../results/ContactResult';

export interface PaginatedContactsResult {
  items: ContactResult[];
  meta: { total: number; page: number; perPage: number; totalPages: number };
}

@Injectable()
export class GetContactByIdUseCase {
  constructor(@Inject(CONTACT_REPOSITORY) private readonly repo: ContactRepository) {}

  async execute(id: string): Promise<ContactResult> {
    const c = await this.repo.findById(id);
    if (!c) throw new ContactNotFoundException(id);
    return toContactResult(c);
  }
}

@Injectable()
export class ListContactsUseCase {
  constructor(@Inject(CONTACT_REPOSITORY) private readonly repo: ContactRepository) {}

  async execute(cmd: ListContactsCommand): Promise<PaginatedContactsResult> {
    const page = cmd.page ?? 1;
    const perPage = cmd.perPage ?? 30;
    const { items, total } = await this.repo.list(
      {
        organizationId: cmd.organizationId,
        type: cmd.type,
        active: cmd.active,
        roleTypeId: cmd.roleTypeId,
        assignedToUserId: cmd.assignedToUserId,
        query: cmd.query,
      },
      page,
      perPage,
    );
    return {
      items: items.map(toContactResult),
      meta: { total, page, perPage, totalPages: computeTotalPages(total, perPage) },
    };
  }
}

@Injectable()
export class SearchContactsUseCase {
  constructor(@Inject(CONTACT_REPOSITORY) private readonly repo: ContactRepository) {}

  async execute(cmd: SearchContactsCommand): Promise<PaginatedContactsResult> {
    const page = cmd.page ?? 1;
    const perPage = cmd.perPage ?? 30;
    const { items, total } = await this.repo.search(cmd.query, page, perPage);
    return {
      items: items.map(toContactResult),
      meta: { total, page, perPage, totalPages: computeTotalPages(total, perPage) },
    };
  }
}

@Injectable()
export class ListContactRoleTypesUseCase {
  constructor(
    @Inject(CONTACT_ROLE_TYPE_REPOSITORY) private readonly repo: ContactRoleTypeRepository,
  ) {}

  async execute(): Promise<ContactRoleTypeResult[]> {
    const items = await this.repo.findAll();
    return items.map(toContactRoleTypeResult);
  }
}
