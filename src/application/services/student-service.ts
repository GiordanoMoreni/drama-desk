import { Student, CreateStudentData, UpdateStudentData, StudentFilters } from '../../domain/entities';
import { StudentRepository } from '../../domain/repositories';
import { PaginationOptions, PaginatedResult } from '../../domain/repositories/base-repository';

export class StudentService {
  constructor(private studentRepository: StudentRepository) {}

  async getStudentById(id: string, organizationId: string): Promise<Student | null> {
    return this.studentRepository.findById(id, organizationId);
  }

  async getStudents(
    organizationId: string,
    filters?: StudentFilters,
    pagination?: PaginationOptions
  ): Promise<PaginatedResult<Student>> {
    return this.studentRepository.findAll(organizationId, filters, pagination);
  }

  async createStudent(data: CreateStudentData, organizationId: string): Promise<Student> {
    // Business logic: validate email uniqueness within organization
    if (data.email) {
      const existingStudent = await this.studentRepository.findByEmail(organizationId, data.email);
      if (existingStudent) {
        throw new Error('A student with this email already exists in your organization');
      }
    }

    // Business logic: ensure names are not empty
    if (!data.firstName.trim() || !data.lastName.trim()) {
      throw new Error('First name and last name are required');
    }

    return this.studentRepository.create(data, organizationId);
  }

  async updateStudent(id: string, data: UpdateStudentData, organizationId: string): Promise<Student | null> {
    // Business logic: validate email uniqueness if email is being updated
    if (data.email) {
      const existingStudent = await this.studentRepository.findByEmail(organizationId, data.email);
      if (existingStudent && existingStudent.id !== id) {
        throw new Error('A student with this email already exists in your organization');
      }
    }

    // Business logic: ensure names are not empty if being updated
    if (data.firstName !== undefined && !data.firstName.trim()) {
      throw new Error('First name cannot be empty');
    }
    if (data.lastName !== undefined && !data.lastName.trim()) {
      throw new Error('Last name cannot be empty');
    }

    return this.studentRepository.update(id, data, organizationId);
  }

  async deleteStudent(id: string, organizationId: string): Promise<boolean> {
    // Business logic: check if student can be deleted
    // (e.g., not enrolled in active classes, etc.)
    // For now, we'll allow deletion, but this could be extended

    return this.studentRepository.delete(id, organizationId);
  }

  async getActiveStudents(organizationId: string): Promise<Student[]> {
    return this.studentRepository.getActiveStudents(organizationId);
  }

  async getStudentStats(organizationId: string) {
    const activeStudents = await this.studentRepository.getActiveStudents(organizationId);

    // Group by grade level
    const gradeStats = activeStudents.reduce((acc, student) => {
      const grade = student.gradeLevel || 'Not specified';
      acc[grade] = (acc[grade] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalActive: activeStudents.length,
      byGrade: gradeStats,
    };
  }

  // Bulk operations
  async bulkUpdateStudents(
    updates: Array<{ id: string; data: UpdateStudentData }>,
    organizationId: string
  ): Promise<Student[]> {
    const results: Student[] = [];

    for (const update of updates) {
      const student = await this.updateStudent(update.id, update.data, organizationId);
      if (student) {
        results.push(student);
      }
    }

    return results;
  }

  async bulkDeleteStudents(ids: string[], organizationId: string): Promise<number> {
    let deletedCount = 0;

    for (const id of ids) {
      const deleted = await this.deleteStudent(id, organizationId);
      if (deleted) {
        deletedCount++;
      }
    }

    return deletedCount;
  }
}