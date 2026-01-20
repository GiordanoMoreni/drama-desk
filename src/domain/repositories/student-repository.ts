import {
  Student,
  CreateStudentData,
  UpdateStudentData,
  StudentFilters
} from '../entities';
import { OrganizationScopedRepository } from './base-repository';

export interface StudentRepository extends OrganizationScopedRepository<
  Student,
  CreateStudentData,
  UpdateStudentData,
  StudentFilters
> {
  findByEmail(organizationId: string, email: string): Promise<Student | null>;
  countByGradeLevel(organizationId: string, gradeLevel: string): Promise<number>;
  getActiveStudents(organizationId: string): Promise<Student[]>;
}