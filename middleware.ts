import { createServerClient } from '@/infrastructure/db/supabase/server-client';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Create a response to mutate
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Create Supabase client
  const supabase = await createServerClient();

  // Refresh session if expired - required for Server Components
  const { data: { session } } = await supabase.auth.getSession();

  // Check for admin testing session
  const adminSession = request.cookies.get('admin-session')?.value;

  // Protect dashboard routes - require authentication or admin session
  if (pathname.startsWith('/dashboard')) {
    if (!session && !adminSession) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Check if user has an organization selected
    const organizationId = request.cookies.get('current-organization')?.value;
    if (!organizationId) {
      return NextResponse.redirect(new URL('/organizations/select', request.url));
    }

    // For admin testing, skip organization verification
    if (adminSession) {
      return response;
    }

    // Verify user has access to the selected organization (only for real users)
    try {
      const { data: memberships } = await supabase
        .from('organization_members')
        .select('organization_id, role')
        .eq('user_id', session!.user.id)
        .eq('organization_id', organizationId)
        .eq('is_active', true)
        .single();

      if (!memberships) {
        // User doesn't have access to this organization, clear cookie and redirect
        response.cookies.delete('current-organization');
        return NextResponse.redirect(new URL('/organizations/select', request.url));
      }
    } catch (error) {
      console.error('Error verifying organization access:', error);
      response.cookies.delete('current-organization');
      return NextResponse.redirect(new URL('/organizations/select', request.url));
    }
  }

  // Organization management routes - require authentication but not organization context
  if (pathname.startsWith('/organizations')) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Redirect authenticated users away from login
  if (pathname === '/login' && session) {
    return NextResponse.redirect(new URL('/organizations/select', request.url));
  }

  // Redirect root to organization selector if authenticated, login if not
  if (pathname === '/') {
    if (session) {
      return NextResponse.redirect(new URL('/organizations/select', request.url));
    } else {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};