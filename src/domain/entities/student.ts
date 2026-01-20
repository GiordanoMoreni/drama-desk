import { TenantEntity, StudentStatus } from './base';

export interface Student extends TenantEntity {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  dateOfBirth?: Date;
  gradeLevel?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  medicalInfo?: string;
  notes?: string;
  isActive: boolean;
}

export interface CreateStudentData {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  dateOfBirth?: Date;
  gradeLevel?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  medicalInfo?: string;
  notes?: string;
}

export interface UpdateStudentData {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  dateOfBirth?: Date;
  gradeLevel?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  medicalInfo?: string;
  notes?: string;
  isActive?: boolean;
}

export interface StudentFilters extends Record<string, unknown> {
  isActive?: boolean;
  gradeLevel?: string;
  search?: string; // Search in firstName, lastName, email
}