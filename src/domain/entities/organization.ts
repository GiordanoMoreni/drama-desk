import { BaseEntity } from './base';

export interface Organization extends BaseEntity {
  name: string;
  slug: string;
  description?: string;
  logoUrl?: string;
  websiteUrl?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  isActive: boolean;
}

export interface OrganizationMember {
  id: string;
  organizationId: string;
  userId: string;
  role: 'admin' | 'teacher' | 'staff';
  isActive: boolean;
  invitedAt: Date;
  joinedAt?: Date;
  invitedBy?: string;
}

export interface CreateOrganizationData {
  name: string;
  slug: string;
  description?: string;
  contactEmail?: string;
  websiteUrl?: string;
}

export interface UpdateOrganizationData {
  name?: string;
  description?: string;
  logoUrl?: string;
  websiteUrl?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  isActive?: boolean;
}