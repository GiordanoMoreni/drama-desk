import {
  Show,
  ShowWithDirector,
  Role,
  RoleWithShow,
  Casting,
  CastingWithDetails,
  CreateShowData,
  UpdateShowData,
  CreateRoleData,
  UpdateRoleData,
  CreateCastingData,
  UpdateCastingData,
  ShowFilters,
  RoleFilters
} from '../entities';
import { OrganizationScopedRepository } from './base-repository';

export interface ShowRepository extends OrganizationScopedRepository<
  Show,
  CreateShowData,
  UpdateShowData,
  ShowFilters
> {
  findWithDirector(id: string, organizationId: string): Promise<ShowWithDirector | null>;
  findByDirector(organizationId: string, directorId: string): Promise<Show[]>;
  getActiveShows(organizationId: string): Promise<Show[]>;
}

export interface RoleRepository extends OrganizationScopedRepository<
  Role,
  CreateRoleData,
  UpdateRoleData,
  RoleFilters
> {
  findWithShow(id: string, organizationId: string): Promise<RoleWithShow | null>;
  findByShow(organizationId: string, showId: string): Promise<Role[]>;
  countByShow(organizationId: string, showId: string): Promise<number>;
}

export interface CastingRepository extends OrganizationScopedRepository<
  Casting,
  CreateCastingData,
  UpdateCastingData,
  CastingFilters
> {
  findWithDetails(id: string, organizationId: string): Promise<CastingWithDetails | null>;
  findByRole(organizationId: string, roleId: string): Promise<CastingWithDetails[]>;
  findByStudent(organizationId: string, studentId: string): Promise<CastingWithDetails[]>;
  findByShow(organizationId: string, showId: string): Promise<CastingWithDetails[]>;
  isCast(organizationId: string, roleId: string, studentId: string): Promise<boolean>;
  countByRole(organizationId: string, roleId: string): Promise<number>;
}

export interface CastingFilters extends Record<string, unknown> {
  roleId?: string;
  studentId?: string;
  showId?: string;
  status?: 'assigned' | 'confirmed' | 'rehearsing' | 'performing' | 'completed';
}