import { SupabaseClient } from '@supabase/supabase-js';
import { Student, CreateStudentData, UpdateStudentData, StudentFilters } from '../../../domain/entities';
import { StudentRepository } from '../../../domain/repositories';
import { StudentRow } from './types';
import { BaseSupabaseRepository } from './base-repository';

export class SupabaseStudentRepository extends BaseSupabaseRepository implements StudentRepository {
  constructor(supabase: SupabaseClient) {
    super(supabase);
  }

  async findById(id: string, organizationId: string): Promise<Student | null> {
    const { data, error } = await this.supabase
      .from('students')
      .select('*')
      .eq('id', id)
      .eq('organization_id', organizationId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Database error: ${error.message}`);
    }

    return this.mapStudentRowToEntity(data);
  }

  async findAll(organizationId: string, filters?: StudentFilters, pagination?: any) {
    let query = this.supabase
      .from('students')
      .select('*', { count: 'exact' })
      .eq('organization_id', organizationId);

    // Apply filters
    if (filters?.isActive !== undefined) {
      query = query.eq('is_active', filters.isActive);
    }

    if (filters?.gradeLevel) {
      query = query.eq('grade_level', filters.gradeLevel);
    }

    if (filters?.search) {
      query = this.buildSearchFilter(query, ['first_name', 'last_name', 'email'], filters.search);
    }

    // Order by last name, first name
    query = query.order('last_name').order('first_name');

    const result = await this.getPaginatedResult<StudentRow>(query, pagination);
    return {
      ...result,
      data: result.data.map(row => this.mapStudentRowToEntity(row)),
    };
  }

  async create(data: CreateStudentData, organizationId: string): Promise<Student> {
    const rowData = this.mapCreateDataToRow(data, organizationId);

    const { data: row, error } = await this.supabase
      .from('students')
      .insert(rowData)
      .select()
      .single();

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return this.mapStudentRowToEntity(row);
  }

  async update(id: string, data: UpdateStudentData, organizationId: string): Promise<Student | null> {
    // First check if the student exists and belongs to the organization
    const exists = await this.checkOrganizationAccess('students', id, organizationId);
    if (!exists) return null;

    const rowData = this.mapUpdateDataToRow(data);

    const { data: row, error } = await this.supabase
      .from('students')
      .update(rowData)
      .eq('id', id)
      .eq('organization_id', organizationId)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Database error: ${error.message}`);
    }

    return this.mapStudentRowToEntity(row);
  }

  async delete(id: string, organizationId: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('students')
      .delete()
      .eq('id', id)
      .eq('organization_id', organizationId);

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return true;
  }

  async exists(id: string, organizationId: string): Promise<boolean> {
    return this.checkOrganizationAccess('students', id, organizationId);
  }

  async findByEmail(organizationId: string, email: string): Promise<Student | null> {
    const { data, error } = await this.supabase
      .from('students')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('email', email)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Database error: ${error.message}`);
    }

    return this.mapStudentRowToEntity(data);
  }

  async countByGradeLevel(organizationId: string, gradeLevel: string): Promise<number> {
    const { count, error } = await this.supabase
      .from('students')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', organizationId)
      .eq('grade_level', gradeLevel)
      .eq('is_active', true);

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return count || 0;
  }

  async getActiveStudents(organizationId: string): Promise<Student[]> {
    const { data, error } = await this.supabase
      .from('students')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('is_active', true)
      .order('last_name')
      .order('first_name');

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return data.map(row => this.mapStudentRowToEntity(row));
  }

  private mapStudentRowToEntity(row: StudentRow): Student {
    return {
      id: row.id,
      organizationId: row.organization_id,
      firstName: row.first_name,
      lastName: row.last_name,
      email: row.email || undefined,
      phone: row.phone || undefined,
      dateOfBirth: row.date_of_birth ? new Date(row.date_of_birth) : undefined,
      gradeLevel: row.grade_level || undefined,
      emergencyContactName: row.emergency_contact_name || undefined,
      emergencyContactPhone: row.emergency_contact_phone || undefined,
      medicalInfo: row.medical_info || undefined,
      notes: row.notes || undefined,
      isActive: row.is_active,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  private mapCreateDataToRow(data: CreateStudentData, organizationId: string): Omit<StudentRow, 'id' | 'created_at' | 'updated_at'> {
    return {
      organization_id: organizationId,
      first_name: data.firstName,
      last_name: data.lastName,
      email: data.email || null,
      phone: data.phone || null,
      date_of_birth: data.dateOfBirth?.toISOString() || null,
      grade_level: data.gradeLevel || null,
      emergency_contact_name: data.emergencyContactName || null,
      emergency_contact_phone: data.emergencyContactPhone || null,
      medical_info: data.medicalInfo || null,
      notes: data.notes || null,
      is_active: true,
    };
  }

  private mapUpdateDataToRow(data: UpdateStudentData): Partial<StudentRow> {
    const updateData: Partial<StudentRow> = {};

    if (data.firstName !== undefined) updateData.first_name = data.firstName;
    if (data.lastName !== undefined) updateData.last_name = data.lastName;
    if (data.email !== undefined) updateData.email = data.email || null;
    if (data.phone !== undefined) updateData.phone = data.phone || null;
    if (data.dateOfBirth !== undefined) updateData.date_of_birth = data.dateOfBirth?.toISOString() || null;
    if (data.gradeLevel !== undefined) updateData.grade_level = data.gradeLevel || null;
    if (data.emergencyContactName !== undefined) updateData.emergency_contact_name = data.emergencyContactName || null;
    if (data.emergencyContactPhone !== undefined) updateData.emergency_contact_phone = data.emergencyContactPhone || null;
    if (data.medicalInfo !== undefined) updateData.medical_info = data.medicalInfo || null;
    if (data.notes !== undefined) updateData.notes = data.notes || null;
    if (data.isActive !== undefined) updateData.is_active = data.isActive;

    return updateData;
  }
}