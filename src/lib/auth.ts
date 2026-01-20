import { createServerClient } from '../infrastructure/db/supabase/server-client';
import { createBrowserClient, createServerClient as createSupabaseServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { config } from '../lib/config';

export interface AuthUser {
  id: string;
  email: string;
  user_metadata?: {
    full_name?: string;
    avatar_url?: string;
  };
}

export interface OrganizationContext {
  organizationId: string;
  organizationName: string;
  userRole: 'admin' | 'teacher' | 'staff';
}

// Get the current authenticated user
export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    // Get cookies once for both admin check and Supabase session
    const cookieStore = await cookies();

    // Check for admin testing session first
    const adminSession = cookieStore.get('admin-session')?.value;
    if (adminSession) {
      console.log('Found admin session, returning admin user');
      return {
        id: 'admin-test-user',
        email: 'admin@test.drama-desk.com',
        user_metadata: {
          full_name: 'Admin User',
        },
      };
    }

    console.log('Checking Supabase session...');

    // Debug: check for Supabase cookies
    const allCookies = cookieStore.getAll();
    console.log('All cookies:', allCookies.map(c => c.name));

    const supabaseCookies = allCookies.filter(c => c.name.startsWith('sb-'));
    console.log('Supabase cookies found:', supabaseCookies.length);

    // Create a simple Supabase client with explicit cookie handling
    const supabase = createSupabaseServerClient(config.supabase.url, config.supabase.anonKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {
          // Not needed for reading session
        },
      },
    });

    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) {
      console.error('Supabase session error:', error);
      return null;
    }

    if (!session?.user) {
      console.log('No Supabase session found');
      return null;
    }

    console.log('Found Supabase user:', session.user.email);
    return {
      id: session.user.id,
      email: session.user.email!,
      user_metadata: session.user.user_metadata,
    };
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

// Get user's organizations and roles
export async function getUserOrganizations(userId: string) {
  try {
    // For admin testing, return fake organizations
    if (userId === 'admin-test-user') {
      console.log('Returning admin test organizations');
      return [
        {
          organizationId: 'admin-test-org-1',
          organizationName: 'Test Theatre Company',
          organizationSlug: 'test-theatre-company',
          userRole: 'admin' as const,
        },
        {
          organizationId: 'admin-test-org-2',
          organizationName: 'Drama Academy',
          organizationSlug: 'drama-academy',
          userRole: 'teacher' as const,
        },
      ];
    }

    console.log('Fetching organizations for user:', userId);
    const supabase = await createServerClient();

    const { data, error } = await supabase
      .from('organization_members')
      .select(`
        organization_id,
        role,
        organizations (
          id,
          name,
          slug
        )
      `)
      .eq('user_id', userId)
      .eq('is_active', true);

    if (error) {
      console.error('Supabase error getting user organizations:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      });
      return [];
    }

    console.log('Found organizations data:', data);
    const organizations = data?.map(item => ({
      organizationId: item.organization_id,
      organizationName: (item.organizations as any)?.name || 'Unknown Organization',
      organizationSlug: (item.organizations as any)?.slug || 'unknown',
      userRole: item.role as 'admin' | 'teacher' | 'staff',
    })) || [];

    console.log('Mapped organizations:', organizations);
    return organizations;
  } catch (error) {
    console.error('Unexpected error getting user organizations:', error);
    return [];
  }
}

// Get the current organization context from cookies/headers
export async function getCurrentOrganization(): Promise<OrganizationContext | null> {
  try {
    const cookieStore = await cookies();
    const organizationId = cookieStore.get('current-organization')?.value;

    if (!organizationId) {
      return null;
    }

    const user = await getCurrentUser();
    if (!user) {
      return null;
    }

    const userOrgs = await getUserOrganizations(user.id);
    const currentOrg = userOrgs.find(org => org.organizationId === organizationId);

    if (!currentOrg) {
      return null;
    }

    return {
      organizationId: currentOrg.organizationId,
      organizationName: currentOrg.organizationName,
      userRole: currentOrg.userRole,
    };
  } catch (error) {
    console.error('Error getting current organization:', error);
    return null;
  }
}

// Set the current organization in cookies
export async function setCurrentOrganization(organizationId: string) {
  const cookieStore = await cookies();
  cookieStore.set('current-organization', organizationId, {
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
}

// Middleware helper to require authentication
export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }
  return user;
}

// Middleware helper to require organization context
export async function requireOrganization() {
  const user = await requireAuth();
  const organization = await getCurrentOrganization();

  if (!organization) {
    // User is authenticated but hasn't selected an organization
    // Redirect to organization selector
    redirect('/organizations/select');
  }

  return { user, organization };
}

// Check if user has required role in current organization
export function requireRole(requiredRoles: ('admin' | 'teacher' | 'staff')[]) {
  return async function() {
    const { user, organization } = await requireOrganization();

    if (!requiredRoles.includes(organization.userRole)) {
      throw new Error(`Access denied. Required roles: ${requiredRoles.join(', ')}`);
    }

    return { user, organization };
  };
}

// Sign out user
export async function signOut() {
  const supabase = await createServerClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error('Error signing out:', error);
    throw error;
  }

  // Clear organization and admin cookies
  const cookieStore = await cookies();
  cookieStore.delete('current-organization');
  cookieStore.delete('admin-session');
}