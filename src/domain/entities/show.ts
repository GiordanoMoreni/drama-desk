import { TenantEntity, ShowStatus, CharacterType, CastingStatus, StaffRole } from './base';

export interface Show extends TenantEntity {
  title: string;
  description?: string;
  directorId?: string;
  startDate?: Date;
  endDate?: Date;
  venue?: string;
  budget?: number;
  status: ShowStatus;
  isActive: boolean;
}

export interface ShowWithDirector extends Show {
  director?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface Role extends TenantEntity {
  showId: string;
  name: string;
  description?: string;
  characterType?: CharacterType;
  isActive: boolean;
}

export interface RoleWithShow extends Role {
  show?: {
    id: string;
    title: string;
    status: ShowStatus;
  };
}

export interface Casting extends TenantEntity {
  roleId: string;
  studentId: string;
  assignedAt: Date;
  status: CastingStatus;
  notes?: string;
}

export interface CastingWithDetails extends Casting {
  role?: {
    id: string;
    name: string;
    characterType?: CharacterType;
    show?: {
      id: string;
      title: string;
    };
  };
  student?: {
    id: string;
    firstName: string;
    lastName: string;
    email?: string;
  };
}

export interface CreateShowData {
  title: string;
  description?: string;
  directorId?: string;
  startDate?: Date;
  endDate?: Date;
  venue?: string;
  budget?: number;
  staffAssignments?: Array<{
    staffMemberId: string;
    role: StaffRole;
    notes?: string;
  }>;
}

export interface UpdateShowData {
  title?: string;
  description?: string;
  directorId?: string;
  startDate?: Date;
  endDate?: Date;
  venue?: string;
  budget?: number;
  status?: ShowStatus;
  isActive?: boolean;
  staffAssignments?: Array<{
    staffMemberId: string;
    role: StaffRole;
    notes?: string;
  }>;
}

export interface CreateRoleData {
  showId: string;
  name: string;
  description?: string;
  characterType?: CharacterType;
}

export interface UpdateRoleData {
  name?: string;
  description?: string;
  characterType?: CharacterType;
  isActive?: boolean;
}

export interface CreateCastingData {
  roleId: string;
  studentId: string;
  notes?: string;
}

export interface UpdateCastingData {
  status?: CastingStatus;
  notes?: string;
}

export interface ShowFilters extends Record<string, unknown> {
  isActive?: boolean;
  directorId?: string;
  status?: ShowStatus;
  search?: string; // Search in title, description
}

export interface RoleFilters extends Record<string, unknown> {
  showId?: string;
  characterType?: CharacterType;
  isActive?: boolean;
  search?: string; // Search in name, description
}
