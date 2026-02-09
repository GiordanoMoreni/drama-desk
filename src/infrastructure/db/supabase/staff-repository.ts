import { SupabaseClient } from '@supabase/supabase-js';
import {
  StaffMember,
  CreateStaffMemberData,
  UpdateStaffMemberData,
  StaffMemberFilters,
  ShowStaffAssignmentWithMember,
  CreateShowStaffAssignmentData,
} from '../../../domain/entities';
import { StaffMemberRepository, ShowStaffAssignmentRepository, PaginationOptions, PaginatedResult } from '../../../domain/repositories';
import { StaffMemberRow } from './types';
import { BaseSupabaseRepository } from './base-repository';

export class SupabaseStaffMemberRepository extends BaseSupabaseRepository implements StaffMemberRepository {
  constructor(supabase: SupabaseClient) {
    super(supabase);
  }

  async findById(id: string, organizationId: string): Promise<StaffMember | null> {
    const { data, error } = await this.supabase
      .from('staff_members')
      .select('*')
      .eq('id', id)
      .eq('organization_id', organizationId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Database error: ${error.message}`);
    }

    return this.mapStaffMemberRowToEntity(data);
  }

  async findAll(
    organizationId: string,
    filters?: StaffMemberFilters,
    pagination?: PaginationOptions
  ): Promise<PaginatedResult<StaffMember>> {
    let query = this.supabase
      .from('staff_members')
      .select('*', { count: 'exact' })
      .eq('organization_id', organizationId);

    if (filters?.isActive !== undefined) {
      query = query.eq('is_active', filters.isActive);
    }

    if (filters?.primaryRole) {
      query = query.eq('primary_role', filters.primaryRole);
    }

    if (filters?.search) {
      query = this.buildSearchFilter(query, ['first_name', 'last_name', 'email'], filters.search);
    }

    query = query.order('last_name').order('first_name');

    const result = await this.getPaginatedResult<StaffMemberRow>(query, pagination);
    return {
      ...result,
      data: result.data.map(row => this.mapStaffMemberRowToEntity(row)),
    };
  }

  async create(data: CreateStaffMemberData, organizationId: string): Promise<StaffMember> {
    const rowData = this.mapCreateDataToRow(data, organizationId);
    const { data: row, error } = await this.supabase.from('staff_members').insert(rowData).select().single();

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return this.mapStaffMemberRowToEntity(row);
  }

  async update(id: string, data: UpdateStaffMemberData, organizationId: string): Promise<StaffMember | null> {
    const exists = await this.checkOrganizationAccess('staff_members', id, organizationId);
    if (!exists) return null;

    const { data: row, error } = await this.supabase
      .from('staff_members')
      .update(this.mapUpdateDataToRow(data))
      .eq('id', id)
      .eq('organization_id', organizationId)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Database error: ${error.message}`);
    }

    return this.mapStaffMemberRowToEntity(row);
  }

  async delete(id: string, organizationId: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('staff_members')
      .delete()
      .eq('id', id)
      .eq('organization_id', organizationId);

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return true;
  }

  async exists(id: string, organizationId: string): Promise<boolean> {
    return this.checkOrganizationAccess('staff_members', id, organizationId);
  }

  async findByEmail(organizationId: string, email: string): Promise<StaffMember | null> {
    const { data, error } = await this.supabase
      .from('staff_members')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('email', email)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Database error: ${error.message}`);
    }

    return this.mapStaffMemberRowToEntity(data);
  }

  async getActiveStaff(organizationId: string): Promise<StaffMember[]> {
    const { data, error } = await this.supabase
      .from('staff_members')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('is_active', true)
      .order('last_name')
      .order('first_name');

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return data.map((row: StaffMemberRow) => this.mapStaffMemberRowToEntity(row));
  }

  private mapStaffMemberRowToEntity(row: StaffMemberRow): StaffMember {
    return {
      id: row.id,
      organizationId: row.organization_id,
      firstName: row.first_name,
      lastName: row.last_name,
      email: row.email || undefined,
      phone: row.phone || undefined,
      primaryRole: row.primary_role,
      notes: row.notes || undefined,
      isActive: row.is_active,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  private mapCreateDataToRow(
    data: CreateStaffMemberData,
    organizationId: string
  ): Omit<StaffMemberRow, 'id' | 'created_at' | 'updated_at'> {
    return {
      organization_id: organizationId,
      first_name: data.firstName,
      last_name: data.lastName,
      email: data.email || null,
      phone: data.phone || null,
      primary_role: data.primaryRole,
      notes: data.notes || null,
      is_active: true,
    };
  }

  private mapUpdateDataToRow(data: UpdateStaffMemberData): Partial<StaffMemberRow> {
    const updateData: Partial<StaffMemberRow> = {};
    if (data.firstName !== undefined) updateData.first_name = data.firstName;
    if (data.lastName !== undefined) updateData.last_name = data.lastName;
    if (data.email !== undefined) updateData.email = data.email || null;
    if (data.phone !== undefined) updateData.phone = data.phone || null;
    if (data.primaryRole !== undefined) updateData.primary_role = data.primaryRole;
    if (data.notes !== undefined) updateData.notes = data.notes || null;
    if (data.isActive !== undefined) updateData.is_active = data.isActive;
    return updateData;
  }
}

export class SupabaseShowStaffAssignmentRepository extends BaseSupabaseRepository implements ShowStaffAssignmentRepository {
  constructor(supabase: SupabaseClient) {
    super(supabase);
  }

  async findByShow(organizationId: string, showId: string): Promise<ShowStaffAssignmentWithMember[]> {
    const { data, error } = await this.supabase
      .from('show_staff_assignments')
      .select(`
        *,
        staff_member:staff_members (
          id,
          first_name,
          last_name,
          email,
          primary_role
        )
      `)
      .eq('organization_id', organizationId)
      .eq('show_id', showId)
      .order('created_at', { ascending: true });

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return (data || []).map((row: AssignmentJoinRow) => this.mapAssignmentRowToEntity(row));
  }

  async create(data: CreateShowStaffAssignmentData, organizationId: string): Promise<ShowStaffAssignmentWithMember> {
    const { data: row, error } = await this.supabase
      .from('show_staff_assignments')
      .insert({
        organization_id: organizationId,
        show_id: data.showId,
        staff_member_id: data.staffMemberId,
        role: data.role,
        notes: data.notes || null,
      })
      .select(`
        *,
        staff_member:staff_members (
          id,
          first_name,
          last_name,
          email,
          primary_role
        )
      `)
      .single();

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return this.mapAssignmentRowToEntity(row);
  }

  async replaceForShow(
    organizationId: string,
    showId: string,
    assignments: Array<{ staffMemberId: string; role: CreateShowStaffAssignmentData['role']; notes?: string }>
  ): Promise<ShowStaffAssignmentWithMember[]> {
    await this.deleteByShow(organizationId, showId);

    if (assignments.length === 0) {
      return [];
    }

    const payload = assignments.map(assignment => ({
      organization_id: organizationId,
      show_id: showId,
      staff_member_id: assignment.staffMemberId,
      role: assignment.role,
      notes: assignment.notes || null,
    }));

    const { data, error } = await this.supabase
      .from('show_staff_assignments')
      .insert(payload)
      .select(`
        *,
        staff_member:staff_members (
          id,
          first_name,
          last_name,
          email,
          primary_role
        )
      `);

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return (data || []).map((row: AssignmentJoinRow) => this.mapAssignmentRowToEntity(row));
  }

  async deleteByShow(organizationId: string, showId: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('show_staff_assignments')
      .delete()
      .eq('organization_id', organizationId)
      .eq('show_id', showId);

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return true;
  }

  private mapAssignmentRowToEntity(row: AssignmentJoinRow): ShowStaffAssignmentWithMember {
    return {
      id: row.id,
      organizationId: row.organization_id,
      showId: row.show_id,
      staffMemberId: row.staff_member_id,
      role: row.role,
      notes: row.notes || undefined,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      staffMember: row.staff_member
        ? {
            id: row.staff_member.id,
            firstName: row.staff_member.first_name,
            lastName: row.staff_member.last_name,
            email: row.staff_member.email || undefined,
            primaryRole: row.staff_member.primary_role,
          }
        : undefined,
    };
  }
}

type AssignmentJoinRow = {
  id: string;
  organization_id: string;
  show_id: string;
  staff_member_id: string;
  role: ShowStaffAssignmentWithMember['role'];
  notes: string | null;
  created_at: string;
  updated_at: string;
  staff_member?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string | null;
    primary_role: ShowStaffAssignmentWithMember['role'];
  } | null;
};
