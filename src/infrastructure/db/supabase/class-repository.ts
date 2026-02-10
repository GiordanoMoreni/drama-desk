import { SupabaseClient } from '@supabase/supabase-js';
import {
  Class,
  ClassWithTeacher,
  ClassEnrollment,
  ClassEnrollmentWithDetails,
  CreateClassData,
  UpdateClassData,
  CreateClassEnrollmentData,
  UpdateClassEnrollmentData,
  ClassFilters
} from '../../../domain/entities';
import { ClassEnrollmentFilters } from '../../../domain/repositories';
import { ClassRepository, ClassEnrollmentRepository } from '../../../domain/repositories';
import { ClassRow, ClassEnrollmentRow } from './types';
import { BaseSupabaseRepository } from './base-repository';

export class SupabaseClassRepository extends BaseSupabaseRepository implements ClassRepository {
  constructor(supabase: SupabaseClient) {
    super(supabase);
  }

  async findById(id: string, organizationId: string): Promise<Class | null> {
    const { data, error } = await this.supabase
      .from('classes')
      .select('*')
      .eq('id', id)
      .eq('organization_id', organizationId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Database error: ${error.message}`);
    }

    return this.mapClassRowToEntity(data);
  }

  async findAll(organizationId: string, filters?: ClassFilters, pagination?: any): Promise<any> {
    let query = this.supabase
      .from('classes')
      .select('*', { count: 'exact' })
      .eq('organization_id', organizationId);

    // Apply filters
    if (filters?.isActive !== undefined) {
      query = query.eq('is_active', filters.isActive);
    }

    if (filters?.teacherId) {
      query = query.eq('teacher_id', filters.teacherId);
    }

    if (filters?.search) {
      query = this.buildSearchFilter(query, ['name', 'description'], filters.search);
    }

    // Order by name
    query = query.order('name');

    const result = await this.getPaginatedResult<ClassRow>(query, pagination);
    return {
      ...result,
      data: result.data.map(row => this.mapClassRowToEntity(row)),
    };
  }

  async create(data: CreateClassData, organizationId: string): Promise<Class> {
    const rowData = this.mapCreateDataToRow(data, organizationId);

    const { data: row, error } = await this.supabase
      .from('classes')
      .insert(rowData)
      .select()
      .single();

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return this.mapClassRowToEntity(row);
  }

  async update(id: string, data: UpdateClassData, organizationId: string): Promise<Class | null> {
    // First check if the class exists and belongs to the organization
    const exists = await this.checkOrganizationAccess('classes', id, organizationId);
    if (!exists) return null;

    const rowData = this.mapUpdateDataToRow(data);

    const { data: row, error } = await this.supabase
      .from('classes')
      .update(rowData)
      .eq('id', id)
      .eq('organization_id', organizationId)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Database error: ${error.message}`);
    }

    return this.mapClassRowToEntity(row);
  }

  async delete(id: string, organizationId: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('classes')
      .delete()
      .eq('id', id)
      .eq('organization_id', organizationId);

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return true;
  }

  async exists(id: string, organizationId: string): Promise<boolean> {
    return this.checkOrganizationAccess('classes', id, organizationId);
  }

  async findWithTeacher(id: string, organizationId: string): Promise<ClassWithTeacher | null> {
    const { data, error } = await this.supabase
      .from('classes')
      .select(`
        *,
        teacher:staff_members!classes_teacher_id_fkey (
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

    return this.mapClassWithTeacherRowToEntity(data);
  }

  async findByTeacher(organizationId: string, teacherId: string): Promise<Class[]> {
    const { data, error } = await this.supabase
      .from('classes')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('teacher_id', teacherId)
      .eq('is_active', true)
      .order('name');

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return data.map(row => this.mapClassRowToEntity(row));
  }

  async getActiveClasses(organizationId: string): Promise<Class[]> {
    const { data, error } = await this.supabase
      .from('classes')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('is_active', true)
      .order('name');

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return data.map(row => this.mapClassRowToEntity(row));
  }

  private mapClassRowToEntity(row: ClassRow): Class {
    return {
      id: row.id,
      organizationId: row.organization_id,
      name: row.name,
      description: row.description || undefined,
      teacherId: row.teacher_id || undefined,
      maxStudents: row.max_students || undefined,
      ageRangeMin: row.age_range_min || undefined,
      ageRangeMax: row.age_range_max || undefined,
      schedule: row.schedule || undefined,
      startDate: row.start_date ? new Date(row.start_date) : undefined,
      endDate: row.end_date ? new Date(row.end_date) : undefined,
      isActive: row.is_active,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  private mapClassWithTeacherRowToEntity(row: any): ClassWithTeacher {
    const classEntity = this.mapClassRowToEntity(row);
    const teacher = row.teacher ? {
      id: row.teacher.id,
      firstName: row.teacher.first_name || '',
      lastName: row.teacher.last_name || '',
      email: row.teacher.email || '',
    } : undefined;

    return {
      ...classEntity,
      teacher,
    };
  }

  private mapCreateDataToRow(data: CreateClassData, organizationId: string): Omit<ClassRow, 'id' | 'created_at' | 'updated_at'> {
    return {
      organization_id: organizationId,
      name: data.name,
      description: data.description || null,
      teacher_id: data.teacherId || null,
      max_students: data.maxStudents || null,
      age_range_min: data.ageRangeMin || null,
      age_range_max: data.ageRangeMax || null,
      schedule: data.schedule || null,
      start_date: data.startDate?.toISOString() || null,
      end_date: data.endDate?.toISOString() || null,
      is_active: true,
    };
  }

  private mapUpdateDataToRow(data: UpdateClassData): Partial<ClassRow> {
    const updateData: Partial<ClassRow> = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description || null;
    if (data.teacherId !== undefined) updateData.teacher_id = data.teacherId || null;
    if (data.maxStudents !== undefined) updateData.max_students = data.maxStudents || null;
    if (data.ageRangeMin !== undefined) updateData.age_range_min = data.ageRangeMin || null;
    if (data.ageRangeMax !== undefined) updateData.age_range_max = data.ageRangeMax || null;
    if (data.schedule !== undefined) updateData.schedule = data.schedule || null;
    if (data.startDate !== undefined) updateData.start_date = data.startDate?.toISOString() || null;
    if (data.endDate !== undefined) updateData.end_date = data.endDate?.toISOString() || null;
    if (data.isActive !== undefined) updateData.is_active = data.isActive;

    return updateData;
  }
}

export class SupabaseClassEnrollmentRepository extends BaseSupabaseRepository implements ClassEnrollmentRepository {
  constructor(supabase: SupabaseClient) {
    super(supabase);
  }

  async findById(id: string, organizationId: string): Promise<ClassEnrollment | null> {
    const { data, error } = await this.supabase
      .from('class_enrollments')
      .select('*')
      .eq('id', id)
      .eq('organization_id', organizationId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Database error: ${error.message}`);
    }

    return this.mapClassEnrollmentRowToEntity(data);
  }

  async findAll(organizationId: string, filters?: ClassEnrollmentFilters, pagination?: any): Promise<any> {
    let query = this.supabase
      .from('class_enrollments')
      .select('*', { count: 'exact' })
      .eq('organization_id', organizationId);

    // Apply filters
    if (filters?.classId) {
      query = query.eq('class_id', filters.classId);
    }

    if (filters?.studentId) {
      query = query.eq('student_id', filters.studentId);
    }

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    // Order by enrolled_at desc
    query = query.order('enrolled_at', { ascending: false });

    const result = await this.getPaginatedResult<ClassEnrollmentRow>(query, pagination);
    return {
      ...result,
      data: result.data.map(row => this.mapClassEnrollmentRowToEntity(row)),
    };
  }

  async create(data: CreateClassEnrollmentData, organizationId: string): Promise<ClassEnrollment> {
    const rowData = this.mapCreateClassEnrollmentDataToRow(data, organizationId);

    const { data: row, error } = await this.supabase
      .from('class_enrollments')
      .insert(rowData)
      .select()
      .single();

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return this.mapClassEnrollmentRowToEntity(row);
  }

  async update(id: string, data: UpdateClassEnrollmentData, organizationId: string): Promise<ClassEnrollment | null> {
    // First check if the enrollment exists and belongs to the organization
    const exists = await this.checkOrganizationAccess('class_enrollments', id, organizationId);
    if (!exists) return null;

    const rowData = this.mapUpdateClassEnrollmentDataToRow(data);

    const { data: row, error } = await this.supabase
      .from('class_enrollments')
      .update(rowData)
      .eq('id', id)
      .eq('organization_id', organizationId)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Database error: ${error.message}`);
    }

    return this.mapClassEnrollmentRowToEntity(row);
  }

  async delete(id: string, organizationId: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('class_enrollments')
      .delete()
      .eq('id', id)
      .eq('organization_id', organizationId);

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return true;
  }

  async exists(id: string, organizationId: string): Promise<boolean> {
    return this.checkOrganizationAccess('class_enrollments', id, organizationId);
  }

  async findWithDetails(id: string, organizationId: string): Promise<ClassEnrollmentWithDetails | null> {
    const { data, error } = await this.supabase
      .from('class_enrollments')
      .select(`
        *,
        student:students (
          id,
          first_name,
          last_name,
          email
        ),
        class:classes (
          id,
          name,
          teacher_id
        )
      `)
      .eq('id', id)
      .eq('organization_id', organizationId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Database error: ${error.message}`);
    }

    return this.mapClassEnrollmentWithDetailsRowToEntity(data);
  }

  async findByClass(organizationId: string, classId: string): Promise<ClassEnrollmentWithDetails[]> {
    const { data, error } = await this.supabase
      .from('class_enrollments')
      .select(`
        *,
        student:students (
          id,
          first_name,
          last_name,
          email
        ),
        class:classes (
          id,
          name,
          teacher_id
        )
      `)
      .eq('organization_id', organizationId)
      .eq('class_id', classId)
      .order('enrolled_at', { ascending: false });

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return data.map(row => this.mapClassEnrollmentWithDetailsRowToEntity(row));
  }

  async findByStudent(organizationId: string, studentId: string): Promise<ClassEnrollmentWithDetails[]> {
    const { data, error } = await this.supabase
      .from('class_enrollments')
      .select(`
        *,
        student:students (
          id,
          first_name,
          last_name,
          email
        ),
        class:classes (
          id,
          name,
          teacher_id
        )
      `)
      .eq('organization_id', organizationId)
      .eq('student_id', studentId)
      .order('enrolled_at', { ascending: false });

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return data.map(row => this.mapClassEnrollmentWithDetailsRowToEntity(row));
  }

  async countEnrolledStudents(organizationId: string, classId: string): Promise<number> {
    const { count, error } = await this.supabase
      .from('class_enrollments')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', organizationId)
      .eq('class_id', classId)
      .eq('status', 'active');

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return count || 0;
  }

  async isEnrolled(organizationId: string, classId: string, studentId: string): Promise<boolean> {
    const { data, error } = await this.supabase
      .from('class_enrollments')
      .select('id')
      .eq('organization_id', organizationId)
      .eq('class_id', classId)
      .eq('student_id', studentId)
      .eq('status', 'active')
      .single();

    return !error && !!data;
  }

  private mapClassEnrollmentRowToEntity(row: ClassEnrollmentRow): ClassEnrollment {
    return {
      id: row.id,
      organizationId: row.organization_id,
      classId: row.class_id,
      studentId: row.student_id,
      enrolledAt: new Date(row.enrolled_at),
      status: row.status,
      notes: row.notes || undefined,
      createdAt: new Date((row as any).created_at || row.enrolled_at),
      updatedAt: new Date((row as any).updated_at || row.enrolled_at),
    };
  }

  private mapClassEnrollmentWithDetailsRowToEntity(row: any): ClassEnrollmentWithDetails {
    const enrollment = this.mapClassEnrollmentRowToEntity(row);
    const student = row.student ? {
      id: row.student.id,
      firstName: row.student.first_name,
      lastName: row.student.last_name,
      email: row.student.email || undefined,
    } : undefined;

    const classData = row.class ? {
      id: row.class.id,
      name: row.class.name,
      teacherId: row.class.teacher_id || undefined,
    } : undefined;

    return {
      ...enrollment,
      student,
      class: classData,
    };
  }

  private mapCreateClassEnrollmentDataToRow(data: CreateClassEnrollmentData, organizationId: string): Omit<ClassEnrollmentRow, 'id'> {
    return {
      organization_id: organizationId,
      class_id: data.classId,
      student_id: data.studentId,
      enrolled_at: new Date().toISOString(),
      status: 'active',
      notes: data.notes || null,
    };
  }

  private mapUpdateClassEnrollmentDataToRow(data: UpdateClassEnrollmentData): Partial<ClassEnrollmentRow> {
    const updateData: Partial<ClassEnrollmentRow> = {};

    if (data.status !== undefined) updateData.status = data.status;
    if (data.notes !== undefined) updateData.notes = data.notes || null;

    return updateData;
  }
}
