import { Inject, Injectable } from '@nestjs/common';
import { computeTotalPages } from '../../../../shared/domain/Pagination';
import { ORGANIZATION_REPOSITORY } from '../../Organizations.Tokens';
import type { OrganizationRepository } from '../../domain/repositories/OrganizationRepository.interface';
import { OrganizationNotFoundException } from '../../domain/exceptions';
import {
  ListOrganizationsCommand,
  SearchOrganizationsCommand,
} from '../commands';
import { OrganizationResult, toOrganizationResult } from '../results/OrganizationResult';

export interface PaginatedOrganizationsResult {
  items: OrganizationResult[];
  meta: { total: number; page: number; perPage: number; totalPages: number };
}

@Injectable()
export class GetOrganizationByIdUseCase {
  constructor(
    @Inject(ORGANIZATION_REPOSITORY) private readonly repo: OrganizationRepository,
  ) {}

  async execute(id: string): Promise<OrganizationResult> {
    const org = await this.repo.findById(id);
    if (!org) throw new OrganizationNotFoundException(id);
    return toOrganizationResult(org);
  }
}

@Injectable()
export class ListOrganizationsUseCase {
  constructor(
    @Inject(ORGANIZATION_REPOSITORY) private readonly repo: OrganizationRepository,
  ) {}

  async execute(cmd: ListOrganizationsCommand): Promise<PaginatedOrganizationsResult> {
    const page = cmd.page ?? 1;
    const perPage = cmd.perPage ?? 30;
    const result = await this.repo.list(
      {
        active: cmd.active,
        isPrimary: cmd.isPrimary,
        countryCode: cmd.countryCode,
        query: cmd.query,
      },
      page,
      perPage,
    );
    return {
      items: result.items.map(toOrganizationResult),
      meta: {
        total: result.total,
        page,
        perPage,
        totalPages: computeTotalPages(result.total, perPage),
      },
    };
  }
}

@Injectable()
export class SearchOrganizationsUseCase {
  constructor(
    @Inject(ORGANIZATION_REPOSITORY) private readonly repo: OrganizationRepository,
  ) {}

  async execute(cmd: SearchOrganizationsCommand): Promise<PaginatedOrganizationsResult> {
    const page = cmd.page ?? 1;
    const perPage = cmd.perPage ?? 30;
    const result = await this.repo.search(cmd.query, page, perPage);
    return {
      items: result.items.map(toOrganizationResult),
      meta: {
        total: result.total,
        page,
        perPage,
        totalPages: computeTotalPages(result.total, perPage),
      },
    };
  }
}
