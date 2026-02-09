import { SupabaseClient } from '@supabase/supabase-js';
import {
  Organization,
  OrganizationMember,
  CreateOrganizationData,
  UpdateOrganizationData
} from '../../../domain/entities';
import { OrganizationFilters } from '../../../domain/repositories';
import { OrganizationRepository } from '../../../domain/repositories';
import { OrganizationRow, OrganizationMemberRow } from './types';
import { BaseSupabaseRepository } from './base-repository';

export class SupabaseOrganizationRepository extends BaseSupabaseRepository implements OrganizationRepository {
  constructor(supabase: SupabaseClient) {
    super(supabase);
  }

  async findById(id: string, organizationId?: string): Promise<Organization | null> {
    const { data, error } = await this.supabase
      .from('organizations')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Database error: ${error.message}`);
    }

    return this.mapOrganizationRowToEntity(data);
  }

  async findAll(organizationId?: string, filters?: OrganizationFilters, pagination?: any): Promise<any> {
    let query = this.supabase
      .from('organizations')
      .select('*', { count: 'exact' });

    // Apply filters
    if (filters?.isActive !== undefined) {
      query = query.eq('is_active', filters.isActive);
    }

    if (filters?.search) {
      query = this.buildSearchFilter(query, ['name', 'slug', 'description'], filters.search);
    }

    // Order by name
    query = query.order('name');

    const result = await this.getPaginatedResult<OrganizationRow>(query, pagination);
    return {
      ...result,
      data: result.data.map(row => this.mapOrganizationRowToEntity(row)),
    };
  }

  async create(data: CreateOrganizationData, organizationId?: string): Promise<Organization> {
    const rowData = this.mapCreateDataToRow(data);

    const { data: row, error } = await this.supabase
      .from('organizations')
      .insert(rowData)
      .select()
      .single();

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return this.mapOrganizationRowToEntity(row);
  }

  async update(id: string, data: UpdateOrganizationData, organizationId?: string): Promise<Organization | null> {
    // First check if organization exists
    const exists = await this.checkOrganizationAccess('organizations', id, id);
    if (!exists) return null;

    const rowData = this.mapUpdateDataToRow(data);

    const { data: row, error } = await this.supabase
      .from('organizations')
      .update(rowData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Database error: ${error.message}`);
    }

    return this.mapOrganizationRowToEntity(row);
  }

  async delete(id: string, organizationId?: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('organizations')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return true;
  }

  async exists(id: string, organizationId?: string): Promise<boolean> {
    return this.checkOrganizationAccess('organizations', id, id);
  }

  async findBySlug(slug: string): Promise<Organization | null> {
    const { data, error } = await this.supabase
      .from('organizations')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Database error: ${error.message}`);
    }

    return this.mapOrganizationRowToEntity(data);
  }

  async findByUserId(userId: string): Promise<Organization[]> {
    const { data, error } = await this.supabase
      .from('organization_members')
      .select(`
        organizations (
          id,
          name,
          slug,
          description,
          logo_url,
          website_url,
          contact_email,
          contact_phone,
          address,
          city,
          state,
          postal_code,
          country,
          is_active,
          created_at,
          updated_at
        )
      `)
      .eq('user_id', userId)
      .eq('is_active', true);

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return data.map((item: any) => this.mapOrganizationRowToEntity(item.organizations));
  }

  async addMember(organizationId: string, userId: string, role: 'admin' | 'teacher' | 'staff', invitedBy?: string): Promise<OrganizationMember> {
    const memberData = {
      organization_id: organizationId,
      user_id: userId,
      role,
      invited_by: invitedBy || null,
      is_active: true,
    };

    const { data, error } = await this.supabase
      .from('organization_members')
      .insert(memberData)
      .select()
      .single();

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return this.mapOrganizationMemberRowToEntity(data);
  }

  async updateMemberRole(organizationId: string, userId: string, role: 'admin' | 'teacher' | 'staff'): Promise<OrganizationMember | null> {
    const { data, error } = await this.supabase
      .from('organization_members')
      .update({ role })
      .eq('organization_id', organizationId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Database error: ${error.message}`);
    }

    return this.mapOrganizationMemberRowToEntity(data);
  }

  async removeMember(organizationId: string, userId: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('organization_members')
      .delete()
      .eq('organization_id', organizationId)
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return true;
  }

  async getMembers(organizationId: string): Promise<OrganizationMember[]> {
    const { data, error } = await this.supabase
      .from('organization_members')
      .select(`
        *,
        user_profiles(first_name, last_name, email)
      `)
      .eq('organization_id', organizationId)
      .order('invited_at');

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return data.map(row => this.mapOrganizationMemberRowToEntity(row));
  }

  async getUserRole(organizationId: string, userId: string): Promise<'admin' | 'teacher' | 'staff' | null> {
    const { data, error } = await this.supabase
      .from('organization_members')
      .select('role')
      .eq('organization_id', organizationId)
      .eq('user_id', userId)
      .eq('is_active', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Database error: ${error.message}`);
    }

    return data.role;
  }

  async isMember(organizationId: string, userId: string): Promise<boolean> {
    const { data, error } = await this.supabase
      .from('organization_members')
      .select('id')
      .eq('organization_id', organizationId)
      .eq('user_id', userId)
      .eq('is_active', true)
      .single();

    return !error && !!data;
  }

  private mapOrganizationRowToEntity(row: OrganizationRow): Organization {
    return {
      id: row.id,
      name: row.name,
      slug: row.slug,
      description: row.description || undefined,
      logoUrl: row.logo_url || undefined,
      websiteUrl: row.website_url || undefined,
      contactEmail: row.contact_email || undefined,
      contactPhone: row.contact_phone || undefined,
      address: row.address || undefined,
      city: row.city || undefined,
      state: row.state || undefined,
      postalCode: row.postal_code || undefined,
      country: row.country || undefined,
      isActive: row.is_active,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  private mapOrganizationMemberRowToEntity(row: any): OrganizationMember {
    const userProfile = row.user_profiles && !Array.isArray(row.user_profiles) ? row.user_profiles : null;
    
    return {
      id: row.id,
      organizationId: row.organization_id,
      userId: row.user_id,
      role: row.role,
      isActive: row.is_active,
      invitedAt: new Date(row.invited_at),
      joinedAt: row.joined_at ? new Date(row.joined_at) : undefined,
      invitedBy: row.invited_by || undefined,
      firstName: userProfile?.first_name || row.first_name || undefined,
      lastName: userProfile?.last_name || row.last_name || undefined,
      email: userProfile?.email || row.email || undefined,
    };
  }

  private mapCreateDataToRow(data: CreateOrganizationData): Omit<OrganizationRow, 'id' | 'created_at' | 'updated_at'> {
    return {
      name: data.name,
      slug: data.slug,
      description: data.description || null,
      logo_url: null,
      contact_email: data.contactEmail || null,
      contact_phone: null,
      website_url: data.websiteUrl || null,
      address: null,
      city: null,
      state: null,
      postal_code: null,
      country: null,
      is_active: true,
    };
  }

  private mapUpdateDataToRow(data: UpdateOrganizationData): Partial<OrganizationRow> {
    const updateData: Partial<OrganizationRow> = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description || null;
    if (data.logoUrl !== undefined) updateData.logo_url = data.logoUrl || null;
    if (data.websiteUrl !== undefined) updateData.website_url = data.websiteUrl || null;
    if (data.contactEmail !== undefined) updateData.contact_email = data.contactEmail || null;
    if (data.contactPhone !== undefined) updateData.contact_phone = data.contactPhone || null;
    if (data.address !== undefined) updateData.address = data.address || null;
    if (data.city !== undefined) updateData.city = data.city || null;
    if (data.state !== undefined) updateData.state = data.state || null;
    if (data.postalCode !== undefined) updateData.postal_code = data.postalCode || null;
    if (data.country !== undefined) updateData.country = data.country || null;
    if (data.isActive !== undefined) updateData.is_active = data.isActive;

    return updateData;
  }
}