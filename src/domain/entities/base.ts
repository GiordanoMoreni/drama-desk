// Base types and interfaces for domain entities

export type UUID = string;

export interface BaseEntity {
  id: UUID;
  createdAt: Date;
  updatedAt: Date;
}

export interface TenantEntity extends BaseEntity {
  organizationId: UUID;
}

export interface OrganizationScoped {
  organizationId: UUID;
}

export type OrganizationRole = 'admin' | 'teacher' | 'staff';

export type StudentStatus = 'active' | 'inactive';
export type ClassEnrollmentStatus = 'active' | 'inactive' | 'completed' | 'dropped';
export type ShowStatus = 'planning' | 'rehearsing' | 'performing' | 'completed' | 'cancelled';
export type CharacterType = 'lead' | 'supporting' | 'ensemble' | 'crew';
export type CastingStatus = 'assigned' | 'confirmed' | 'rehearsing' | 'performing' | 'completed';