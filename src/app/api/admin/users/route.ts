import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { createAdminClient } from '@/infrastructure/db/supabase/server-client';

export async function GET(request: Request) {
  try {
    const user = await requireAuth();
    
    const supabase = await createAdminClient();

    // Fetch users with their organization memberships
    const { data: members, error } = await supabase
      .from('organization_members')
      .select(`
        id,
        user_id,
        organization_id,
        role,
        is_active,
        invited_at,
        joined_at,
        organizations(id, name, slug),
        user_profiles(first_name, last_name, email)
      `)
      .order('invited_at', { ascending: false });

    if (error) {
      console.error('Error fetching members:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(members);
  } catch (error: any) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: error?.message || 'Internal server error' }, { status: 500 });
  }
}
