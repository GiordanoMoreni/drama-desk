import { createServerClient } from '@/infrastructure/db/supabase/server-client';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  console.log('=== MIDDLEWARE CALLED ===');
  console.log('Request path:', request.nextUrl.pathname);
  console.log('Request method:', request.method);

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