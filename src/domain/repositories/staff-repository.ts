import {
  StaffMember,
  CreateStaffMemberData,
  UpdateStaffMemberData,
  StaffMemberFilters,
  ShowStaffAssignmentWithMember,
  CreateShowStaffAssignmentData,
} from '../entities';
import { OrganizationScopedRepository } from './base-repository';

export interface StaffMemberRepository extends OrganizationScopedRepository<
  StaffMember,
  CreateStaffMemberData,
  UpdateStaffMemberData,
  StaffMemberFilters
> {
  findByEmail(organizationId: string, email: string): Promise<StaffMember | null>;
  getActiveStaff(organizationId: string): Promise<StaffMember[]>;
}

export interface ShowStaffAssignmentRepository {
  findByShow(organizationId: string, showId: string): Promise<ShowStaffAssignmentWithMember[]>;
  create(data: CreateShowStaffAssignmentData, organizationId: string): Promise<ShowStaffAssignmentWithMember>;
  replaceForShow(
    organizationId: string,
    showId: string,
    assignments: Array<{ staffMemberId: string; role: CreateShowStaffAssignmentData['role']; notes?: string }>
  ): Promise<ShowStaffAssignmentWithMember[]>;
  deleteByShow(organizationId: string, showId: string): Promise<boolean>;
}
