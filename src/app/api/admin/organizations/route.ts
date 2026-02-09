import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { createAdminClient } from '@/infrastructure/db/supabase/server-client';

export async function GET(request: Request) {
  try {
    const user = await requireAuth();
    
    // For now, only allow admin users to access this
    // In production, verify user is an actual admin
    const supabase = await createAdminClient();

    const { data: organizations, error } = await supabase
      .from('organizations')
      .select(`
        id,
        name,
        slug,
        description,
        is_active,
        contact_email,
        created_at,
        updated_at
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching organizations:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Get member count for each organization
    const orgsWithMemberCount = await Promise.all(
      (organizations || []).map(async (org: any) => {
        const { count } = await supabase
          .from('organization_members')
          .select('*', { count: 'exact', head: true })
          .eq('organization_id', org.id);

        const { count: adminCount } = await supabase
          .from('organization_members')
          .select('*', { count: 'exact', head: true })
          .eq('organization_id', org.id)
          .eq('role', 'admin');

        return {
          ...org,
          memberCount: count || 0,
          adminCount: adminCount || 0,
        };
      })
    );

    return NextResponse.json(orgsWithMemberCount);
  } catch (error: any) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: error?.message || 'Internal server error' }, { status: 500 });
  }
}
