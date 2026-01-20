import { UUID } from '../entities';

export interface PaginationOptions {
  page?: number;
  limit?: number;
  offset?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface BaseRepository<T, CreateData, UpdateData, Filters extends Record<string, unknown> = Record<string, unknown>> {
  findById(id: UUID, organizationId?: UUID): Promise<T | null>;
  findAll(organizationId?: UUID, filters?: Filters, pagination?: PaginationOptions): Promise<PaginatedResult<T>>;
  create(data: CreateData, organizationId?: UUID): Promise<T>;
  update(id: UUID, data: UpdateData, organizationId?: UUID): Promise<T | null>;
  delete(id: UUID, organizationId?: UUID): Promise<boolean>;
  exists(id: UUID, organizationId?: UUID): Promise<boolean>;
}

export interface OrganizationScopedRepository<T, CreateData, UpdateData, Filters extends Record<string, unknown> = Record<string, unknown>>
  extends BaseRepository<T, CreateData, UpdateData, Filters> {
  // Additional methods specific to organization-scoped repositories
}