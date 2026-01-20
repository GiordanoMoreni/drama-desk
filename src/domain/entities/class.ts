import { TenantEntity } from './base';

export interface Class extends TenantEntity {
  name: string;
  description?: string;
  teacherId?: string;
  maxStudents?: number;
  ageRangeMin?: number;
  ageRangeMax?: number;
  schedule?: ClassSchedule;
  startDate?: Date;
  endDate?: Date;
  isActive: boolean;
}

export interface ClassSchedule {
  days: string[]; // ['monday', 'wednesday', 'friday']
  startTime: string; // '18:00'
  endTime: string; // '19:30'
  timezone?: string;
}

export interface ClassWithTeacher extends Class {
  teacher?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface ClassEnrollment extends TenantEntity {
  classId: string;
  studentId: string;
  enrolledAt: Date;
  status: 'active' | 'inactive' | 'completed' | 'dropped';
  notes?: string;
}

export interface ClassEnrollmentWithDetails extends ClassEnrollment {
  student?: {
    id: string;
    firstName: string;
    lastName: string;
    email?: string;
  };
  class?: {
    id: string;
    name: string;
    teacherId?: string;
  };
}

export interface CreateClassData {
  name: string;
  description?: string;
  teacherId?: string;
  maxStudents?: number;
  ageRangeMin?: number;
  ageRangeMax?: number;
  schedule?: ClassSchedule;
  startDate?: Date;
  endDate?: Date;
}

export interface UpdateClassData {
  name?: string;
  description?: string;
  teacherId?: string;
  maxStudents?: number;
  ageRangeMin?: number;
  ageRangeMax?: number;
  schedule?: ClassSchedule;
  startDate?: Date;
  endDate?: Date;
  isActive?: boolean;
}

export interface CreateClassEnrollmentData {
  classId: string;
  studentId: string;
  notes?: string;
}

export interface UpdateClassEnrollmentData {
  status?: 'active' | 'inactive' | 'completed' | 'dropped';
  notes?: string;
}

export interface ClassFilters extends Record<string, unknown> {
  isActive?: boolean;
  teacherId?: string;
  search?: string; // Search in name, description
}