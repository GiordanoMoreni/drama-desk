import {
  Organization,
  OrganizationMember,
  CreateOrganizationData,
  UpdateOrganizationData
} from '../entities';
import { OrganizationScopedRepository } from './base-repository';

export interface OrganizationRepository extends OrganizationScopedRepository<
  Organization,
  CreateOrganizationData,
  UpdateOrganizationData,
  OrganizationFilters
> {
  findBySlug(slug: string): Promise<Organization | null>;
  findByUserId(userId: string): Promise<Organization[]>;
  addMember(organizationId: string, userId: string, role: 'admin' | 'teacher' | 'staff', invitedBy?: string): Promise<OrganizationMember>;
  updateMemberRole(organizationId: string, userId: string, role: 'admin' | 'teacher' | 'staff'): Promise<OrganizationMember | null>;
  getMemberById(organizationId: string, memberId: string): Promise<OrganizationMember | null>;
  getActiveStaffMemberById(organizationId: string, staffMemberId: string): Promise<{
    id: string;
    organizationId: string;
    isActive: boolean;
  } | null>;
  findMemberByStaffMemberId(organizationId: string, staffMemberId: string): Promise<OrganizationMember | null>;
  linkStaffMember(organizationId: string, memberId: string, staffMemberId: string): Promise<OrganizationMember | null>;
  unlinkStaffMember(organizationId: string, memberId: string): Promise<OrganizationMember | null>;
  removeMember(organizationId: string, userId: string): Promise<boolean>;
  getMembers(organizationId: string): Promise<OrganizationMember[]>;
  getUserRole(organizationId: string, userId: string): Promise<'admin' | 'teacher' | 'staff' | null>;
  isMember(organizationId: string, userId: string): Promise<boolean>;
}

export interface OrganizationFilters extends Record<string, unknown> {
  isActive?: boolean;
  search?: string; // Search in name, slug, description
}
