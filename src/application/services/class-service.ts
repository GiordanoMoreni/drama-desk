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
} from '../../domain/entities';
import {
  ClassRepository,
  ClassEnrollmentRepository,
  PaginationOptions,
  PaginatedResult,
  ClassEnrollmentFilters
} from '../../domain/repositories';

export class ClassService {
  constructor(
    private classRepository: ClassRepository,
    private classEnrollmentRepository: ClassEnrollmentRepository
  ) {}

  async getClassById(id: string, organizationId: string): Promise<Class | null> {
    return this.classRepository.findById(id, organizationId);
  }

  async getClassWithTeacher(id: string, organizationId: string): Promise<ClassWithTeacher | null> {
    return this.classRepository.findWithTeacher(id, organizationId);
  }

  async getClasses(
    organizationId: string,
    filters?: ClassFilters,
    pagination?: PaginationOptions
  ): Promise<PaginatedResult<Class>> {
    return this.classRepository.findAll(organizationId, filters, pagination);
  }

  async createClass(data: CreateClassData, organizationId: string): Promise<Class> {
    // Business logic: validate required fields
    if (!data.name.trim()) {
      throw new Error('Class name is required');
    }

    // Business logic: validate age range if provided
    if (data.ageRangeMin !== undefined && data.ageRangeMax !== undefined) {
      if (data.ageRangeMin > data.ageRangeMax) {
        throw new Error('Minimum age cannot be greater than maximum age');
      }
    }

    return this.classRepository.create(data, organizationId);
  }

  async updateClass(id: string, data: UpdateClassData, organizationId: string): Promise<Class | null> {
    // Business logic: validate name if being updated
    if (data.name !== undefined && !data.name.trim()) {
      throw new Error('Class name cannot be empty');
    }

    // Business logic: validate age range if being updated
    if (data.ageRangeMin !== undefined || data.ageRangeMax !== undefined) {
      const currentClass = await this.classRepository.findById(id, organizationId);
      if (!currentClass) return null;

      const minAge = data.ageRangeMin !== undefined ? data.ageRangeMin : currentClass.ageRangeMin;
      const maxAge = data.ageRangeMax !== undefined ? data.ageRangeMax : currentClass.ageRangeMax;

      if (minAge !== undefined && maxAge !== undefined && minAge > maxAge) {
        throw new Error('Minimum age cannot be greater than maximum age');
      }
    }

    return this.classRepository.update(id, data, organizationId);
  }

  async deleteClass(id: string, organizationId: string): Promise<boolean> {
    // Business logic: check if class has active enrollments
    const enrollments = await this.classEnrollmentRepository.findByClass(organizationId, id);
    const hasActiveEnrollments = enrollments.some(e => e.status === 'active');

    if (hasActiveEnrollments) {
      throw new Error('Cannot delete class with active student enrollments');
    }

    return this.classRepository.delete(id, organizationId);
  }

  async getActiveClasses(organizationId: string): Promise<Class[]> {
    return this.classRepository.getActiveClasses(organizationId);
  }

  async getClassesByTeacher(organizationId: string, teacherId: string): Promise<Class[]> {
    return this.classRepository.findByTeacher(organizationId, teacherId);
  }

  // Class Enrollment methods
  async getClassEnrollmentById(id: string, organizationId: string): Promise<ClassEnrollment | null> {
    return this.classEnrollmentRepository.findById(id, organizationId);
  }

  async getClassEnrollmentWithDetails(id: string, organizationId: string): Promise<ClassEnrollmentWithDetails | null> {
    return this.classEnrollmentRepository.findWithDetails(id, organizationId);
  }

  async getClassEnrollments(
    organizationId: string,
    filters?: ClassEnrollmentFilters,
    pagination?: PaginationOptions
  ): Promise<PaginatedResult<ClassEnrollment>> {
    return this.classEnrollmentRepository.findAll(organizationId, filters, pagination);
  }

  async enrollStudent(data: CreateClassEnrollmentData, organizationId: string): Promise<ClassEnrollment> {
    // Business logic: check if student is already enrolled in this class
    const isEnrolled = await this.classEnrollmentRepository.isEnrolled(organizationId, data.classId, data.studentId);
    if (isEnrolled) {
      throw new Error('Student is already enrolled in this class');
    }

    // Business logic: check class capacity
    const classData = await this.classRepository.findById(data.classId, organizationId);
    if (!classData) {
      throw new Error('Class not found');
    }

    if (classData.maxStudents) {
      const enrolledCount = await this.classEnrollmentRepository.countEnrolledStudents(organizationId, data.classId);
      if (enrolledCount >= classData.maxStudents) {
        throw new Error('Class is at maximum capacity');
      }
    }

    return this.classEnrollmentRepository.create(data, organizationId);
  }

  async updateClassEnrollment(id: string, data: UpdateClassEnrollmentData, organizationId: string): Promise<ClassEnrollment | null> {
    return this.classEnrollmentRepository.update(id, data, organizationId);
  }

  async unenrollStudent(id: string, organizationId: string): Promise<boolean> {
    // Business logic: mark as dropped instead of deleting
    return this.classEnrollmentRepository.update(id, { status: 'dropped' }, organizationId) !== null;
  }

  async getEnrollmentsByClass(organizationId: string, classId: string): Promise<ClassEnrollmentWithDetails[]> {
    return this.classEnrollmentRepository.findByClass(organizationId, classId);
  }

  async getEnrollmentsByStudent(organizationId: string, studentId: string): Promise<ClassEnrollmentWithDetails[]> {
    return this.classEnrollmentRepository.findByStudent(organizationId, studentId);
  }

  async getClassStats(organizationId: string, classId: string) {
    const enrollments = await this.classEnrollmentRepository.findByClass(organizationId, classId);

    const stats = {
      totalEnrolled: enrollments.length,
      active: enrollments.filter(e => e.status === 'active').length,
      completed: enrollments.filter(e => e.status === 'completed').length,
      dropped: enrollments.filter(e => e.status === 'dropped').length,
      inactive: enrollments.filter(e => e.status === 'inactive').length,
    };

    return stats;
  }

  async getTotalEnrollments(organizationId: string): Promise<number> {
    const activeClasses = await this.getActiveClasses(organizationId);
    let totalEnrollments = 0;

    for (const classData of activeClasses) {
      const enrolledCount = await this.classEnrollmentRepository.countEnrolledStudents(organizationId, classData.id);
      totalEnrollments += enrolledCount;
    }

    return totalEnrollments;
  }

  // Bulk operations
  async bulkEnrollStudents(
    enrollments: Array<{ classId: string; studentId: string; notes?: string }>,
    organizationId: string
  ): Promise<ClassEnrollment[]> {
    const results: ClassEnrollment[] = [];

    for (const enrollment of enrollments) {
      try {
        const result = await this.enrollStudent(enrollment, organizationId);
        results.push(result);
      } catch (error) {
        // Continue with other enrollments but log error
        console.error(`Failed to enroll student ${enrollment.studentId} in class ${enrollment.classId}:`, error);
      }
    }

    return results;
  }

  async bulkUpdateEnrollments(
    updates: Array<{ id: string; data: UpdateClassEnrollmentData }>,
    organizationId: string
  ): Promise<ClassEnrollment[]> {
    const results: ClassEnrollment[] = [];

    for (const update of updates) {
      const enrollment = await this.updateClassEnrollment(update.id, update.data, organizationId);
      if (enrollment) {
        results.push(enrollment);
      }
    }

    return results;
  }
}