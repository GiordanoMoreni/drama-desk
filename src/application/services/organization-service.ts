import {
  Organization,
  OrganizationMember,
  CreateOrganizationData,
  UpdateOrganizationData
} from '../../domain/entities';
import {
  OrganizationRepository,
  PaginationOptions,
  PaginatedResult,
  OrganizationFilters
} from '../../domain/repositories';

export class OrganizationService {
  constructor(private organizationRepository: OrganizationRepository) {}

  private assertAdminRole(userRole: 'admin' | 'teacher' | 'staff') {
    if (userRole !== 'admin') {
      throw new Error('Only organization admins can link or unlink staff members');
    }
  }

  async getOrganizationById(id: string, organizationId?: string): Promise<Organization | null> {
    return this.organizationRepository.findById(id, organizationId || id);
  }

  async getOrganizations(
    organizationId?: string,
    filters?: OrganizationFilters,
    pagination?: PaginationOptions
  ): Promise<PaginatedResult<Organization>> {
    return this.organizationRepository.findAll(organizationId || '', filters, pagination);
  }

  async createOrganization(data: CreateOrganizationData, creatorUserId: string): Promise<Organization> {
    // Business logic: validate required fields
    if (!data.name.trim()) {
      throw new Error('Organization name is required');
    }

    if (!data.slug.trim()) {
      throw new Error('Organization slug is required');
    }

    // Business logic: validate slug format (alphanumeric, hyphens, lowercase)
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    if (!slugRegex.test(data.slug)) {
      throw new Error('Organization slug must contain only lowercase letters, numbers, and hyphens');
    }

    // Business logic: check if slug is unique
    const existingOrg = await this.organizationRepository.findBySlug(data.slug);
    if (existingOrg) {
      throw new Error('An organization with this slug already exists');
    }

    // Business logic: validate contact email format if provided
    if (data.contactEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.contactEmail)) {
        throw new Error('Invalid contact email format');
      }
    }

    const organization = await this.organizationRepository.create(data);

    // Business logic: add creator as admin member
    await this.organizationRepository.addMember(
      organization.id,
      creatorUserId,
      'admin',
      undefined // No inviter for the creator
    );

    return organization;
  }

  async updateOrganization(id: string, data: UpdateOrganizationData): Promise<Organization | null> {
    // Business logic: validate name if being updated
    if (data.name !== undefined && !data.name.trim()) {
      throw new Error('Organization name cannot be empty');
    }

    // Note: slug cannot be updated after organization creation

    // Business logic: validate contact email if being updated
    if (data.contactEmail !== undefined && data.contactEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.contactEmail)) {
        throw new Error('Invalid contact email format');
      }
    }

    return this.organizationRepository.update(id, data);
  }

  async deleteOrganization(id: string): Promise<boolean> {
    // Business logic: check if organization has members
    const members = await this.organizationRepository.getMembers(id);
    if (members.length > 0) {
      throw new Error('Cannot delete organization with active members');
    }

    return this.organizationRepository.delete(id);
  }

  async getOrganizationBySlug(slug: string): Promise<Organization | null> {
    return this.organizationRepository.findBySlug(slug);
  }

  async getUserOrganizations(userId: string): Promise<Organization[]> {
    return this.organizationRepository.findByUserId(userId);
  }

  // Member management
  async addMember(
    organizationId: string,
    userId: string,
    role: 'admin' | 'teacher' | 'staff',
    invitedBy?: string
  ): Promise<OrganizationMember> {
    // Business logic: check if user is already a member
    const isMember = await this.organizationRepository.isMember(organizationId, userId);
    if (isMember) {
      throw new Error('User is already a member of this organization');
    }

    // Business logic: validate role
    const validRoles = ['admin', 'teacher', 'staff'];
    if (!validRoles.includes(role)) {
      throw new Error('Invalid role specified');
    }

    return this.organizationRepository.addMember(organizationId, userId, role, invitedBy);
  }

  async updateMemberRole(
    organizationId: string,
    userId: string,
    role: 'admin' | 'teacher' | 'staff'
  ): Promise<OrganizationMember | null> {
    // Business logic: validate role
    const validRoles = ['admin', 'teacher', 'staff'];
    if (!validRoles.includes(role)) {
      throw new Error('Invalid role specified');
    }

    // Business logic: prevent removing the last admin
    if (role !== 'admin') {
      const members = await this.organizationRepository.getMembers(organizationId);
      const adminCount = members.filter(m => m.role === 'admin' && m.isActive).length;
      const currentRole = await this.organizationRepository.getUserRole(organizationId, userId);

      if (currentRole === 'admin' && adminCount <= 1) {
        throw new Error('Cannot remove the last admin from the organization');
      }
    }

    return this.organizationRepository.updateMemberRole(organizationId, userId, role);
  }

  async removeMember(organizationId: string, userId: string): Promise<boolean> {
    // Business logic: prevent removing the last admin
    const members = await this.organizationRepository.getMembers(organizationId);
    const adminCount = members.filter(m => m.role === 'admin' && m.isActive).length;
    const currentRole = await this.organizationRepository.getUserRole(organizationId, userId);

    if (currentRole === 'admin' && adminCount <= 1) {
      throw new Error('Cannot remove the last admin from the organization');
    }

    return this.organizationRepository.removeMember(organizationId, userId);
  }

  async getOrganizationMembers(organizationId: string): Promise<OrganizationMember[]> {
    return this.organizationRepository.getMembers(organizationId);
  }

  async linkStaffMemberToOrganizationMember(
    organizationId: string,
    memberId: string,
    staffMemberId: string,
    userRole: 'admin' | 'teacher' | 'staff'
  ): Promise<OrganizationMember> {
    this.assertAdminRole(userRole);

    const member = await this.organizationRepository.getMemberById(organizationId, memberId);
    if (!member) {
      throw new Error('Organization member not found');
    }

    const staffMember = await this.organizationRepository.getActiveStaffMemberById(organizationId, staffMemberId);
    if (!staffMember) {
      throw new Error('Staff member not found in this organization');
    }

    if (!staffMember.isActive) {
      throw new Error('Staff member is not active');
    }

    if (staffMember.organizationId !== organizationId) {
      throw new Error('Staff member belongs to a different organization');
    }

    const existingLinkedMember = await this.organizationRepository.findMemberByStaffMemberId(
      organizationId,
      staffMemberId
    );

    if (existingLinkedMember && existingLinkedMember.id !== memberId) {
      throw new Error('Staff member is already linked to another organization member');
    }

    const updatedMember = await this.organizationRepository.linkStaffMember(
      organizationId,
      memberId,
      staffMemberId
    );

    if (!updatedMember) {
      throw new Error('Organization member not found');
    }

    return updatedMember;
  }

  async unlinkStaffMemberFromOrganizationMember(
    organizationId: string,
    memberId: string,
    userRole: 'admin' | 'teacher' | 'staff'
  ): Promise<OrganizationMember> {
    this.assertAdminRole(userRole);

    const member = await this.organizationRepository.getMemberById(organizationId, memberId);
    if (!member) {
      throw new Error('Organization member not found');
    }

    const updatedMember = await this.organizationRepository.unlinkStaffMember(organizationId, memberId);
    if (!updatedMember) {
      throw new Error('Organization member not found');
    }

    return updatedMember;
  }

  async getUserRole(organizationId: string, userId: string): Promise<'admin' | 'teacher' | 'staff' | null> {
    return this.organizationRepository.getUserRole(organizationId, userId);
  }

  async isUserMember(organizationId: string, userId: string): Promise<boolean> {
    return this.organizationRepository.isMember(organizationId, userId);
  }

  async transferOwnership(organizationId: string, currentOwnerId: string, newOwnerId: string): Promise<boolean> {
    // Business logic: verify current owner is admin
    const currentRole = await this.organizationRepository.getUserRole(organizationId, currentOwnerId);
    if (currentRole !== 'admin') {
      throw new Error('Only admins can transfer ownership');
    }

    // Business logic: verify new owner is a member
    const isMember = await this.organizationRepository.isMember(organizationId, newOwnerId);
    if (!isMember) {
      throw new Error('New owner must be a member of the organization');
    }

    // Update both users' roles
    await this.organizationRepository.updateMemberRole(organizationId, currentOwnerId, 'staff');
    await this.organizationRepository.updateMemberRole(organizationId, newOwnerId, 'admin');

    return true;
  }

  async getOrganizationStats(organizationId: string) {
    const members = await this.organizationRepository.getMembers(organizationId);

    const stats = {
      totalMembers: members.length,
      activeMembers: members.filter(m => m.isActive).length,
      admins: members.filter(m => m.role === 'admin' && m.isActive).length,
      teachers: members.filter(m => m.role === 'teacher' && m.isActive).length,
      staff: members.filter(m => m.role === 'staff' && m.isActive).length,
    };

    return stats;
  }
}
