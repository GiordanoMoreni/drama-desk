import { StaffRole, TenantEntity } from './base';

export interface StaffMember extends TenantEntity {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  primaryRole: StaffRole;
  notes?: string;
  isActive: boolean;
}

export interface ShowStaffAssignment extends TenantEntity {
  showId: string;
  staffMemberId: string;
  role: StaffRole;
  notes?: string;
}

export interface ShowStaffAssignmentWithMember extends ShowStaffAssignment {
  staffMember?: {
    id: string;
    firstName: string;
    lastName: string;
    email?: string;
    primaryRole: StaffRole;
  };
}

export interface CreateStaffMemberData {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  primaryRole: StaffRole;
  notes?: string;
}

export interface UpdateStaffMemberData {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  primaryRole?: StaffRole;
  notes?: string;
  isActive?: boolean;
}

export interface StaffMemberFilters extends Record<string, unknown> {
  primaryRole?: StaffRole;
  isActive?: boolean;
  search?: string;
}

export interface CreateShowStaffAssignmentData {
  showId: string;
  staffMemberId: string;
  role: StaffRole;
  notes?: string;
}

export interface ReplaceShowStaffAssignmentsData {
  showId: string;
  assignments: Array<{
    staffMemberId: string;
    role: StaffRole;
    notes?: string;
  }>;
}
