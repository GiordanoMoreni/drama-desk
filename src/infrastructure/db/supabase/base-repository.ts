import { SupabaseClient } from '@supabase/supabase-js';
import { UUID } from '../../../domain/entities';
import { PaginationOptions, PaginatedResult } from '../../../domain/repositories';

export abstract class BaseSupabaseRepository {
  constructor(protected supabase: SupabaseClient) {}

  protected async getPaginatedResult<T>(
    query: any,
    pagination?: PaginationOptions
  ): Promise<PaginatedResult<T>> {
    const page = pagination?.page || 1;
    const limit = pagination?.limit || 10;
    const offset = pagination?.offset || (page - 1) * limit;

    // Use a single query to get both data and count
    const { data, error, count } = await query
      .range(offset, offset + limit - 1);

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    const total = count || 0;
    const totalPages = Math.ceil(total / limit);

    return {
      data: data || [],
      total,
      page,
      limit,
      totalPages,
    };
  }

  protected buildSearchFilter(query: any, searchFields: string[], searchTerm?: string) {
    if (!searchTerm || searchFields.length === 0) return query;

    const searchConditions = searchFields.map(field =>
      `${field}.ilike.%${searchTerm}%`
    );

    return query.or(searchConditions.join(','));
  }

  protected async checkOrganizationAccess(
    table: string,
    id: UUID,
    organizationId: UUID,
    userId?: string
  ): Promise<boolean> {
    const query = this.supabase
      .from(table)
      .select('id')
      .eq('id', id)
      .eq('organization_id', organizationId);

    // If userId is provided, let RLS handle the authorization
    // Otherwise, this is an admin operation

    const { data, error } = await query.single();

    if (error) {
      if (error.code === 'PGRST116') { // No rows found
        return false;
      }
      throw new Error(`Database error: ${error.message}`);
    }

    return !!data;
  }

  protected mapDateFields<T extends Record<string, any>>(row: T): T {
    const mapped = { ...row };

    // Convert snake_case date fields to camelCase Date objects
    Object.keys(mapped).forEach(key => {
      if (key.includes('_at') || key.includes('_date') || key === 'date_of_birth') {
        const value = (mapped as any)[key];
        if (value && typeof value === 'string') {
          (mapped as any)[key] = new Date(value);
        }
      }
    });

    return mapped;
  }
}