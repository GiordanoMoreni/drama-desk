import { SupabaseClient } from '@supabase/supabase-js';
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
} from '../../../domain/entities';
import { CastingFilters } from '../../../domain/repositories';
import { ShowRepository, RoleRepository, CastingRepository } from '../../../domain/repositories';
import { ShowRow, RoleRow, CastingRow } from './types';
import { BaseSupabaseRepository } from './base-repository';

export class SupabaseShowRepository extends BaseSupabaseRepository implements ShowRepository {
  constructor(supabase: SupabaseClient) {
    super(supabase);
  }

  async findById(id: string, organizationId: string): Promise<Show | null> {
    const { data, error } = await this.supabase
      .from('shows')
      .select('*')
      .eq('id', id)
      .eq('organization_id', organizationId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Database error: ${error.message}`);
    }

    return this.mapShowRowToEntity(data);
  }

  async findAll(organizationId: string, filters?: ShowFilters, pagination?: any): Promise<any> {
    let query = this.supabase
      .from('shows')
      .select('*', { count: 'exact' })
      .eq('organization_id', organizationId);

    // Apply filters
    if (filters?.isActive !== undefined) {
      query = query.eq('is_active', filters.isActive);
    }

    if (filters?.directorId) {
      query = query.eq('director_id', filters.directorId);
    }

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.search) {
      query = this.buildSearchFilter(query, ['title', 'description'], filters.search);
    }

    // Order by created_at desc
    query = query.order('created_at', { ascending: false });

    const result = await this.getPaginatedResult<ShowRow>(query, pagination);
    return {
      ...result,
      data: result.data.map(row => this.mapShowRowToEntity(row)),
    };
  }

  async create(data: CreateShowData, organizationId: string): Promise<Show> {
    const rowData = this.mapCreateDataToRow(data, organizationId);

    const { data: row, error } = await this.supabase
      .from('shows')
      .insert(rowData)
      .select()
      .single();

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return this.mapShowRowToEntity(row);
  }

  async update(id: string, data: UpdateShowData, organizationId: string): Promise<Show | null> {
    // First check if the show exists and belongs to the organization
    const exists = await this.checkOrganizationAccess('shows', id, organizationId);
    if (!exists) return null;

    const rowData = this.mapUpdateDataToRow(data);

    const { data: row, error } = await this.supabase
      .from('shows')
      .update(rowData)
      .eq('id', id)
      .eq('organization_id', organizationId)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Database error: ${error.message}`);
    }

    return this.mapShowRowToEntity(row);
  }

  async delete(id: string, organizationId: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('shows')
      .delete()
      .eq('id', id)
      .eq('organization_id', organizationId);

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return true;
  }

  async exists(id: string, organizationId: string): Promise<boolean> {
    return this.checkOrganizationAccess('shows', id, organizationId);
  }

  async findWithDirector(id: string, organizationId: string): Promise<ShowWithDirector | null> {
    const { data, error } = await this.supabase
      .from('shows')
      .select(`
        *,
        director:organization_members!shows_director_id_fkey (
          id,
          user_id,
          first_name:users!inner(raw_user_meta_data->>'full_name'),
          last_name:users!inner(raw_user_meta_data->>'full_name'),
          email:users!inner(email)
        )
      `)
      .eq('id', id)
      .eq('organization_id', organizationId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Database error: ${error.message}`);
    }

    return this.mapShowWithDirectorRowToEntity(data);
  }

  async findByDirector(organizationId: string, directorId: string): Promise<Show[]> {
    const { data, error } = await this.supabase
      .from('shows')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('director_id', directorId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return data.map(row => this.mapShowRowToEntity(row));
  }

  async getActiveShows(organizationId: string): Promise<Show[]> {
    const { data, error } = await this.supabase
      .from('shows')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return data.map(row => this.mapShowRowToEntity(row));
  }

  private mapShowRowToEntity(row: ShowRow): Show {
    return {
      id: row.id,
      organizationId: row.organization_id,
      title: row.title,
      description: row.description || undefined,
      directorId: row.director_id || undefined,
      startDate: row.start_date ? new Date(row.start_date) : undefined,
      endDate: row.end_date ? new Date(row.end_date) : undefined,
      venue: row.venue || undefined,
      budget: row.budget || undefined,
      status: row.status,
      isActive: row.is_active,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  private mapShowWithDirectorRowToEntity(row: any): ShowWithDirector {
    const show = this.mapShowRowToEntity(row);
    const director = row.director ? {
      id: row.director.id,
      firstName: this.extractFirstName(row.director.first_name),
      lastName: this.extractLastName(row.director.last_name),
      email: row.director.email,
    } : undefined;

    return {
      ...show,
      director,
    };
  }

  private extractFirstName(fullName: string): string {
    if (!fullName) return '';
    const parts = fullName.split(' ');
    return parts[0] || '';
  }

  private extractLastName(fullName: string): string {
    if (!fullName) return '';
    const parts = fullName.split(' ');
    return parts.length > 1 ? parts[parts.length - 1] : '';
  }

  private mapCreateDataToRow(data: CreateShowData, organizationId: string): Omit<ShowRow, 'id' | 'created_at' | 'updated_at'> {
    return {
      organization_id: organizationId,
      title: data.title,
      description: data.description || null,
      director_id: data.directorId || null,
      start_date: data.startDate?.toISOString() || null,
      end_date: data.endDate?.toISOString() || null,
      venue: data.venue || null,
      budget: data.budget || null,
      status: 'planning',
      is_active: true,
    };
  }

  private mapUpdateDataToRow(data: UpdateShowData): Partial<ShowRow> {
    const updateData: Partial<ShowRow> = {};

    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description || null;
    if (data.directorId !== undefined) updateData.director_id = data.directorId || null;
    if (data.startDate !== undefined) updateData.start_date = data.startDate?.toISOString() || null;
    if (data.endDate !== undefined) updateData.end_date = data.endDate?.toISOString() || null;
    if (data.venue !== undefined) updateData.venue = data.venue || null;
    if (data.budget !== undefined) updateData.budget = data.budget || null;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.isActive !== undefined) updateData.is_active = data.isActive;

    return updateData;
  }
}

export class SupabaseRoleRepository extends BaseSupabaseRepository implements RoleRepository {
  constructor(supabase: SupabaseClient) {
    super(supabase);
  }

  async findById(id: string, organizationId: string): Promise<Role | null> {
    const { data, error } = await this.supabase
      .from('roles')
      .select('*')
      .eq('id', id)
      .eq('organization_id', organizationId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Database error: ${error.message}`);
    }

    return this.mapRoleRowToEntity(data);
  }

  async findAll(organizationId: string, filters?: RoleFilters, pagination?: any): Promise<any> {
    let query = this.supabase
      .from('roles')
      .select('*', { count: 'exact' })
      .eq('organization_id', organizationId);

    // Apply filters
    if (filters?.showId) {
      query = query.eq('show_id', filters.showId);
    }

    if (filters?.characterType) {
      query = query.eq('character_type', filters.characterType);
    }

    if (filters?.isActive !== undefined) {
      query = query.eq('is_active', filters.isActive);
    }

    if (filters?.search) {
      query = this.buildSearchFilter(query, ['name', 'description'], filters.search);
    }

    // Order by name
    query = query.order('name');

    const result = await this.getPaginatedResult<RoleRow>(query, pagination);
    return {
      ...result,
      data: result.data.map(row => this.mapRoleRowToEntity(row)),
    };
  }

  async create(data: CreateRoleData, organizationId: string): Promise<Role> {
    const rowData = this.mapCreateRoleDataToRow(data, organizationId);

    const { data: row, error } = await this.supabase
      .from('roles')
      .insert(rowData)
      .select()
      .single();

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return this.mapRoleRowToEntity(row);
  }

  async update(id: string, data: UpdateRoleData, organizationId: string): Promise<Role | null> {
    // First check if the role exists and belongs to the organization
    const exists = await this.checkOrganizationAccess('roles', id, organizationId);
    if (!exists) return null;

    const rowData = this.mapUpdateRoleDataToRow(data);

    const { data: row, error } = await this.supabase
      .from('roles')
      .update(rowData)
      .eq('id', id)
      .eq('organization_id', organizationId)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Database error: ${error.message}`);
    }

    return this.mapRoleRowToEntity(row);
  }

  async delete(id: string, organizationId: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('roles')
      .delete()
      .eq('id', id)
      .eq('organization_id', organizationId);

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return true;
  }

  async exists(id: string, organizationId: string): Promise<boolean> {
    return this.checkOrganizationAccess('roles', id, organizationId);
  }

  async findWithShow(id: string, organizationId: string): Promise<RoleWithShow | null> {
    const { data, error } = await this.supabase
      .from('roles')
      .select(`
        *,
        show:shows (
          id,
          title,
          status
        )
      `)
      .eq('id', id)
      .eq('organization_id', organizationId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Database error: ${error.message}`);
    }

    return this.mapRoleWithShowRowToEntity(data);
  }

  async findByShow(organizationId: string, showId: string): Promise<Role[]> {
    const { data, error } = await this.supabase
      .from('roles')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('show_id', showId)
      .eq('is_active', true)
      .order('name');

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return data.map(row => this.mapRoleRowToEntity(row));
  }

  async countByShow(organizationId: string, showId: string): Promise<number> {
    const { count, error } = await this.supabase
      .from('roles')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', organizationId)
      .eq('show_id', showId)
      .eq('is_active', true);

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return count || 0;
  }

  private mapRoleRowToEntity(row: RoleRow): Role {
    return {
      id: row.id,
      organizationId: row.organization_id,
      showId: row.show_id,
      name: row.name,
      description: row.description || undefined,
      characterType: row.character_type || undefined,
      isActive: row.is_active,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  private mapRoleWithShowRowToEntity(row: any): RoleWithShow {
    const role = this.mapRoleRowToEntity(row);
    const show = row.show ? {
      id: row.show.id,
      title: row.show.title,
      status: row.show.status,
    } : undefined;

    return {
      ...role,
      show,
    };
  }

  private mapCreateRoleDataToRow(data: CreateRoleData, organizationId: string): Omit<RoleRow, 'id' | 'created_at' | 'updated_at'> {
    return {
      organization_id: organizationId,
      show_id: data.showId,
      name: data.name,
      description: data.description || null,
      character_type: data.characterType || null,
      is_active: true,
    };
  }

  private mapUpdateRoleDataToRow(data: UpdateRoleData): Partial<RoleRow> {
    const updateData: Partial<RoleRow> = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description || null;
    if (data.characterType !== undefined) updateData.character_type = data.characterType || null;
    if (data.isActive !== undefined) updateData.is_active = data.isActive;

    return updateData;
  }
}

export class SupabaseCastingRepository extends BaseSupabaseRepository implements CastingRepository {
  constructor(supabase: SupabaseClient) {
    super(supabase);
  }

  async findById(id: string, organizationId: string): Promise<Casting | null> {
    const { data, error } = await this.supabase
      .from('castings')
      .select('*')
      .eq('id', id)
      .eq('organization_id', organizationId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Database error: ${error.message}`);
    }

    return this.mapCastingRowToEntity(data);
  }

  async findAll(organizationId: string, filters?: CastingFilters, pagination?: any): Promise<any> {
    let query = this.supabase
      .from('castings')
      .select('*', { count: 'exact' })
      .eq('organization_id', organizationId);

    // Apply filters
    if (filters?.roleId) {
      query = query.eq('role_id', filters.roleId);
    }

    if (filters?.studentId) {
      query = query.eq('student_id', filters.studentId);
    }

    if (filters?.showId) {
      // This requires a join, but for simplicity we'll handle this in findByShow
      // For now, we'll skip this filter in findAll
    }

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    // Order by assigned_at desc
    query = query.order('assigned_at', { ascending: false });

    const result = await this.getPaginatedResult<CastingRow>(query, pagination);
    return {
      ...result,
      data: result.data.map(row => this.mapCastingRowToEntity(row)),
    };
  }

  async create(data: CreateCastingData, organizationId: string): Promise<Casting> {
    const rowData = this.mapCreateCastingDataToRow(data, organizationId);

    const { data: row, error } = await this.supabase
      .from('castings')
      .insert(rowData)
      .select()
      .single();

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return this.mapCastingRowToEntity(row);
  }

  async update(id: string, data: UpdateCastingData, organizationId: string): Promise<Casting | null> {
    // First check if the casting exists and belongs to the organization
    const exists = await this.checkOrganizationAccess('castings', id, organizationId);
    if (!exists) return null;

    const rowData = this.mapUpdateCastingDataToRow(data);

    const { data: row, error } = await this.supabase
      .from('castings')
      .update(rowData)
      .eq('id', id)
      .eq('organization_id', organizationId)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Database error: ${error.message}`);
    }

    return this.mapCastingRowToEntity(row);
  }

  async delete(id: string, organizationId: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('castings')
      .delete()
      .eq('id', id)
      .eq('organization_id', organizationId);

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return true;
  }

  async exists(id: string, organizationId: string): Promise<boolean> {
    return this.checkOrganizationAccess('castings', id, organizationId);
  }

  async findWithDetails(id: string, organizationId: string): Promise<CastingWithDetails | null> {
    const { data, error } = await this.supabase
      .from('castings')
      .select(`
        *,
        role:roles (
          id,
          name,
          character_type,
          show:shows (
            id,
            title
          )
        ),
        student:students (
          id,
          first_name,
          last_name,
          email
        )
      `)
      .eq('id', id)
      .eq('organization_id', organizationId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Database error: ${error.message}`);
    }

    return this.mapCastingWithDetailsRowToEntity(data);
  }

  async findByRole(organizationId: string, roleId: string): Promise<CastingWithDetails[]> {
    const { data, error } = await this.supabase
      .from('castings')
      .select(`
        *,
        role:roles (
          id,
          name,
          character_type,
          show:shows (
            id,
            title
          )
        ),
        student:students (
          id,
          first_name,
          last_name,
          email
        )
      `)
      .eq('organization_id', organizationId)
      .eq('role_id', roleId)
      .order('assigned_at', { ascending: false });

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return data.map(row => this.mapCastingWithDetailsRowToEntity(row));
  }

  async findByStudent(organizationId: string, studentId: string): Promise<CastingWithDetails[]> {
    const { data, error } = await this.supabase
      .from('castings')
      .select(`
        *,
        role:roles (
          id,
          name,
          character_type,
          show:shows (
            id,
            title
          )
        ),
        student:students (
          id,
          first_name,
          last_name,
          email
        )
      `)
      .eq('organization_id', organizationId)
      .eq('student_id', studentId)
      .order('assigned_at', { ascending: false });

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return data.map(row => this.mapCastingWithDetailsRowToEntity(row));
  }

  async findByShow(organizationId: string, showId: string): Promise<CastingWithDetails[]> {
    const { data, error } = await this.supabase
      .from('castings')
      .select(`
        *,
        role:roles!inner (
          id,
          name,
          character_type,
          show_id
        ),
        student:students (
          id,
          first_name,
          last_name,
          email
        )
      `)
      .eq('organization_id', organizationId)
      .eq('role.show_id', showId)
      .order('assigned_at', { ascending: false });

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return data.map(row => this.mapCastingWithDetailsRowToEntity({
      ...row,
      role: {
        ...row.role,
        show: { id: showId, title: '' } // We'll need to fetch show title separately if needed
      }
    }));
  }

  async isCast(organizationId: string, roleId: string, studentId: string): Promise<boolean> {
    const { data, error } = await this.supabase
      .from('castings')
      .select('id')
      .eq('organization_id', organizationId)
      .eq('role_id', roleId)
      .eq('student_id', studentId)
      .neq('status', 'completed')
      .single();

    return !error && !!data;
  }

  async countByRole(organizationId: string, roleId: string): Promise<number> {
    const { count, error } = await this.supabase
      .from('castings')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', organizationId)
      .eq('role_id', roleId)
      .neq('status', 'completed');

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return count || 0;
  }

  private mapCastingRowToEntity(row: CastingRow): Casting {
    return {
      id: row.id,
      organizationId: row.organization_id,
      roleId: row.role_id,
      studentId: row.student_id,
      assignedAt: new Date(row.assigned_at),
      status: row.status,
      notes: row.notes || undefined,
      createdAt: new Date((row as any).created_at || row.assigned_at),
      updatedAt: new Date((row as any).updated_at || row.assigned_at),
    };
  }

  private mapCastingWithDetailsRowToEntity(row: any): CastingWithDetails {
    const casting = this.mapCastingRowToEntity(row);
    const role = row.role ? {
      id: row.role.id,
      name: row.role.name,
      characterType: row.role.character_type || undefined,
      show: row.role.show ? {
        id: row.role.show.id,
        title: row.role.show.title,
      } : undefined,
    } : undefined;

    const student = row.student ? {
      id: row.student.id,
      firstName: row.student.first_name,
      lastName: row.student.last_name,
      email: row.student.email || undefined,
    } : undefined;

    return {
      ...casting,
      role,
      student,
    };
  }

  private mapCreateCastingDataToRow(data: CreateCastingData, organizationId: string): Omit<CastingRow, 'id'> {
    return {
      organization_id: organizationId,
      role_id: data.roleId,
      student_id: data.studentId,
      assigned_at: new Date().toISOString(),
      status: 'assigned',
      notes: data.notes || null,
    };
  }

  private mapUpdateCastingDataToRow(data: UpdateCastingData): Partial<CastingRow> {
    const updateData: Partial<CastingRow> = {};

    if (data.status !== undefined) updateData.status = data.status;
    if (data.notes !== undefined) updateData.notes = data.notes || null;

    return updateData;
  }
}