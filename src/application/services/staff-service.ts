import {
  StaffMember,
  CreateStaffMemberData,
  UpdateStaffMemberData,
  StaffMemberFilters,
  ShowStaffAssignmentWithMember,
} from '../../domain/entities';
import {
  StaffMemberRepository,
  ShowStaffAssignmentRepository,
  PaginationOptions,
  PaginatedResult,
} from '../../domain/repositories';

export class StaffService {
  constructor(
    private staffMemberRepository: StaffMemberRepository,
    private showStaffAssignmentRepository: ShowStaffAssignmentRepository
  ) {}

  async getStaffMemberById(id: string, organizationId: string): Promise<StaffMember | null> {
    return this.staffMemberRepository.findById(id, organizationId);
  }

  async getStaffMembers(
    organizationId: string,
    filters?: StaffMemberFilters,
    pagination?: PaginationOptions
  ): Promise<PaginatedResult<StaffMember>> {
    return this.staffMemberRepository.findAll(organizationId, filters, pagination);
  }

  async createStaffMember(data: CreateStaffMemberData, organizationId: string): Promise<StaffMember> {
    if (!data.firstName.trim() || !data.lastName.trim()) {
      throw new Error('First name and last name are required');
    }

    if (data.email) {
      const existing = await this.staffMemberRepository.findByEmail(organizationId, data.email);
      if (existing) {
        throw new Error('A staff member with this email already exists');
      }
    }

    return this.staffMemberRepository.create(data, organizationId);
  }

  async updateStaffMember(
    id: string,
    data: UpdateStaffMemberData,
    organizationId: string
  ): Promise<StaffMember | null> {
    if (data.firstName !== undefined && !data.firstName.trim()) {
      throw new Error('First name cannot be empty');
    }
    if (data.lastName !== undefined && !data.lastName.trim()) {
      throw new Error('Last name cannot be empty');
    }
    if (data.email) {
      const existing = await this.staffMemberRepository.findByEmail(organizationId, data.email);
      if (existing && existing.id !== id) {
        throw new Error('A staff member with this email already exists');
      }
    }

    return this.staffMemberRepository.update(id, data, organizationId);
  }

  async deleteStaffMember(id: string, organizationId: string): Promise<boolean> {
    return this.staffMemberRepository.delete(id, organizationId);
  }

  async getActiveStaff(organizationId: string): Promise<StaffMember[]> {
    return this.staffMemberRepository.getActiveStaff(organizationId);
  }

  async getShowAssignments(organizationId: string, showId: string): Promise<ShowStaffAssignmentWithMember[]> {
    return this.showStaffAssignmentRepository.findByShow(organizationId, showId);
  }

  async replaceShowAssignments(
    organizationId: string,
    showId: string,
    assignments: Array<{ staffMemberId: string; role: StaffMember['primaryRole']; notes?: string }>
  ): Promise<ShowStaffAssignmentWithMember[]> {
    return this.showStaffAssignmentRepository.replaceForShow(organizationId, showId, assignments);
  }

  async removeShowAssignments(organizationId: string, showId: string): Promise<boolean> {
    return this.showStaffAssignmentRepository.deleteByShow(organizationId, showId);
  }
}
