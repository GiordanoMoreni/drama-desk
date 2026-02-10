import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  console.log('=== MIDDLEWARE CALLED ===');
  console.log('Request path:', request.nextUrl.pathname);
  console.log('Request method:', request.method);

  // Redirect old dashboard routes to new structure
  // /dashboard/students -> /dashboard/[organizationId]/students
  const pathname = request.nextUrl.pathname;
  const dashboardRoutes = [
    'students',
    'classes',
    'shows',
    'organization',
    'profile',
  ];

  for (const route of dashboardRoutes) {
    if (pathname === `/dashboard/${route}` || pathname.startsWith(`/dashboard/${route}/`)) {
      // Get the organization ID from the cookie
      const orgCookie = request.cookies.get('current-organization');
      const organizationId = orgCookie?.value;

      if (organizationId) {
        // Redirect to new route structure
        const newPath = pathname.replace(`/dashboard/`, `/dashboard/${organizationId}/`);
        console.log(`Redirecting ${pathname} to ${newPath}`);
        return NextResponse.redirect(new URL(newPath, request.url));
      } else {
        // No organization selected, redirect to dashboard
        console.log(`No organization selected for ${pathname}, redirecting to /dashboard`);
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    }
  }

  // Debug: log all API requests
  if (request.nextUrl.pathname.startsWith('/api/')) {
    console.log('=== MIDDLEWARE API REQUEST ===');
    console.log('Path:', request.nextUrl.pathname);
    console.log('Method:', request.method);
    console.log('URL:', request.url);
    console.log('Headers:', Object.fromEntries(request.headers.entries()));
    console.log('Cookies:', request.cookies.getAll().map(c => c.name));
    console.log('=== END MIDDLEWARE API REQUEST ===');
  }

  // Log dashboard page requests
  if (request.nextUrl.pathname === '/dashboard') {
    console.log('=== DASHBOARD PAGE REQUEST ===');
    console.log('Method:', request.method);
    console.log('Headers:', Object.fromEntries(request.headers.entries()));
    console.log('Cookies:', request.cookies.getAll().map(c => `${c.name}=${c.value.substring(0, 20)}...`));
    console.log('=== END DASHBOARD PAGE REQUEST ===');
  }

  console.log('=== MIDDLEWARE END ===');

  // For now, just pass through - we can add authentication later
  return NextResponse.next();
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
