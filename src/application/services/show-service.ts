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
} from '../../domain/entities';
import {
  ShowRepository,
  RoleRepository,
  CastingRepository,
  PaginationOptions,
  PaginatedResult,
  CastingFilters
} from '../../domain/repositories';

export class ShowService {
  constructor(
    private showRepository: ShowRepository,
    private roleRepository: RoleRepository,
    private castingRepository: CastingRepository
  ) {}

  async getShowById(id: string, organizationId: string): Promise<Show | null> {
    return this.showRepository.findById(id, organizationId);
  }

  async getShowWithDirector(id: string, organizationId: string): Promise<ShowWithDirector | null> {
    return this.showRepository.findWithDirector(id, organizationId);
  }

  async getShows(
    organizationId: string,
    filters?: ShowFilters,
    pagination?: PaginationOptions
  ): Promise<PaginatedResult<Show>> {
    return this.showRepository.findAll(organizationId, filters, pagination);
  }

  async createShow(data: CreateShowData, organizationId: string): Promise<Show> {
    // Business logic: validate required fields
    if (!data.title.trim()) {
      throw new Error('Show title is required');
    }

    // Business logic: validate dates if provided
    if (data.startDate && data.endDate && data.startDate > data.endDate) {
      throw new Error('Start date cannot be after end date');
    }

    return this.showRepository.create(data, organizationId);
  }

  async updateShow(id: string, data: UpdateShowData, organizationId: string): Promise<Show | null> {
    // Business logic: validate title if being updated
    if (data.title !== undefined && !data.title.trim()) {
      throw new Error('Show title cannot be empty');
    }

    // Business logic: validate dates if being updated
    if (data.startDate !== undefined || data.endDate !== undefined) {
      const currentShow = await this.showRepository.findById(id, organizationId);
      if (!currentShow) return null;

      const startDate = data.startDate !== undefined ? data.startDate : currentShow.startDate;
      const endDate = data.endDate !== undefined ? data.endDate : currentShow.endDate;

      if (startDate && endDate && startDate > endDate) {
        throw new Error('Start date cannot be after end date');
      }
    }

    return this.showRepository.update(id, data, organizationId);
  }

  async deleteShow(id: string, organizationId: string): Promise<boolean> {
    // Business logic: check if show has roles or castings
    const rolesCount = await this.roleRepository.countByShow(organizationId, id);
    if (rolesCount > 0) {
      throw new Error('Cannot delete show that has roles assigned');
    }

    return this.showRepository.delete(id, organizationId);
  }

  async getActiveShows(organizationId: string): Promise<Show[]> {
    return this.showRepository.getActiveShows(organizationId);
  }

  async getShowsByDirector(organizationId: string, directorId: string): Promise<Show[]> {
    return this.showRepository.findByDirector(organizationId, directorId);
  }

  // Role methods
  async getRoleById(id: string, organizationId: string): Promise<Role | null> {
    return this.roleRepository.findById(id, organizationId);
  }

  async getRoleWithShow(id: string, organizationId: string): Promise<RoleWithShow | null> {
    return this.roleRepository.findWithShow(id, organizationId);
  }

  async getRoles(
    organizationId: string,
    filters?: RoleFilters,
    pagination?: PaginationOptions
  ): Promise<PaginatedResult<Role>> {
    return this.roleRepository.findAll(organizationId, filters, pagination);
  }

  async createRole(data: CreateRoleData, organizationId: string): Promise<Role> {
    // Business logic: validate required fields
    if (!data.name.trim()) {
      throw new Error('Role name is required');
    }

    // Business logic: check if show exists and belongs to organization
    const show = await this.showRepository.findById(data.showId, organizationId);
    if (!show) {
      throw new Error('Show not found');
    }

    return this.roleRepository.create(data, organizationId);
  }

  async updateRole(id: string, data: UpdateRoleData, organizationId: string): Promise<Role | null> {
    // Business logic: validate name if being updated
    if (data.name !== undefined && !data.name.trim()) {
      throw new Error('Role name cannot be empty');
    }

    return this.roleRepository.update(id, data, organizationId);
  }

  async deleteRole(id: string, organizationId: string): Promise<boolean> {
    // Business logic: check if role has active castings
    const castings = await this.castingRepository.findByRole(organizationId, id);
    const hasActiveCastings = castings.some(c => c.status !== 'completed');

    if (hasActiveCastings) {
      throw new Error('Cannot delete role with active castings');
    }

    return this.roleRepository.delete(id, organizationId);
  }

  async getRolesByShow(organizationId: string, showId: string): Promise<Role[]> {
    return this.roleRepository.findByShow(organizationId, showId);
  }

  // Casting methods
  async getCastingById(id: string, organizationId: string): Promise<Casting | null> {
    return this.castingRepository.findById(id, organizationId);
  }

  async getCastingWithDetails(id: string, organizationId: string): Promise<CastingWithDetails | null> {
    return this.castingRepository.findWithDetails(id, organizationId);
  }

  async getCastings(
    organizationId: string,
    filters?: CastingFilters,
    pagination?: PaginationOptions
  ): Promise<PaginatedResult<Casting>> {
    return this.castingRepository.findAll(organizationId, filters, pagination);
  }

  async castStudent(data: CreateCastingData, organizationId: string): Promise<Casting> {
    // Business logic: check if student is already cast in this role
    const isCast = await this.castingRepository.isCast(organizationId, data.roleId, data.studentId);
    if (isCast) {
      throw new Error('Student is already cast in this role');
    }

    // Business logic: check if role exists and belongs to organization
    const role = await this.roleRepository.findById(data.roleId, organizationId);
    if (!role) {
      throw new Error('Role not found');
    }

    return this.castingRepository.create(data, organizationId);
  }

  async updateCasting(id: string, data: UpdateCastingData, organizationId: string): Promise<Casting | null> {
    return this.castingRepository.update(id, data, organizationId);
  }

  async uncastStudent(id: string, organizationId: string): Promise<boolean> {
    // Business logic: mark as completed instead of deleting
    return this.castingRepository.update(id, { status: 'completed' }, organizationId) !== null;
  }

  async getCastingsByRole(organizationId: string, roleId: string): Promise<CastingWithDetails[]> {
    return this.castingRepository.findByRole(organizationId, roleId);
  }

  async getCastingsByStudent(organizationId: string, studentId: string): Promise<CastingWithDetails[]> {
    return this.castingRepository.findByStudent(organizationId, studentId);
  }

  async getCastingsByShow(organizationId: string, showId: string): Promise<CastingWithDetails[]> {
    return this.castingRepository.findByShow(organizationId, showId);
  }

  async getShowStats(organizationId: string, showId: string) {
    const roles = await this.roleRepository.findByShow(organizationId, showId);
    const castings = await this.castingRepository.findByShow(organizationId, showId);

    const stats = {
      totalRoles: roles.length,
      castRoles: roles.filter(role =>
        castings.some(casting => casting.roleId === role.id && casting.status !== 'completed')
      ).length,
      totalCastings: castings.length,
      activeCastings: castings.filter(c => c.status === 'assigned' || c.status === 'confirmed').length,
      rehearsingCastings: castings.filter(c => c.status === 'rehearsing').length,
      performingCastings: castings.filter(c => c.status === 'performing').length,
    };

    return stats;
  }

  // Bulk operations
  async bulkCastStudents(
    castings: Array<{ roleId: string; studentId: string; notes?: string }>,
    organizationId: string
  ): Promise<Casting[]> {
    const results: Casting[] = [];

    for (const casting of castings) {
      try {
        const result = await this.castStudent(casting, organizationId);
        results.push(result);
      } catch (error) {
        // Continue with other castings but log error
        console.error(`Failed to cast student ${casting.studentId} in role ${casting.roleId}:`, error);
      }
    }

    return results;
  }

  async bulkUpdateCastings(
    updates: Array<{ id: string; data: UpdateCastingData }>,
    organizationId: string
  ): Promise<Casting[]> {
    const results: Casting[] = [];

    for (const update of updates) {
      const casting = await this.updateCasting(update.id, update.data, organizationId);
      if (casting) {
        results.push(casting);
      }
    }

    return results;
  }
}