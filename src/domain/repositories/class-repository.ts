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
} from '../entities';
import { OrganizationScopedRepository } from './base-repository';

export interface ClassRepository extends OrganizationScopedRepository<
  Class,
  CreateClassData,
  UpdateClassData,
  ClassFilters
> {
  findWithTeacher(id: string, organizationId: string): Promise<ClassWithTeacher | null>;
  findByTeacher(organizationId: string, teacherId: string): Promise<Class[]>;
  getActiveClasses(organizationId: string): Promise<Class[]>;
}

export interface ClassEnrollmentRepository extends OrganizationScopedRepository<
  ClassEnrollment,
  CreateClassEnrollmentData,
  UpdateClassEnrollmentData,
  ClassEnrollmentFilters
> {
  findWithDetails(id: string, organizationId: string): Promise<ClassEnrollmentWithDetails | null>;
  findByClass(organizationId: string, classId: string): Promise<ClassEnrollmentWithDetails[]>;
  findByStudent(organizationId: string, studentId: string): Promise<ClassEnrollmentWithDetails[]>;
  countEnrolledStudents(organizationId: string, classId: string): Promise<number>;
  isEnrolled(organizationId: string, classId: string, studentId: string): Promise<boolean>;
}

export interface ClassEnrollmentFilters extends Record<string, unknown> {
  classId?: string;
  studentId?: string;
  status?: 'active' | 'inactive' | 'completed' | 'dropped';
}