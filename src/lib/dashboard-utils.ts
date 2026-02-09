import { redirect } from 'next/navigation';
import { getCurrentOrganization } from '@/lib/auth';

/**
 * Utility function for old dashboard routes to redirect to new structure
 * Use this in old /dashboard/[page]/layout.tsx or page.tsx files
 */
export async function requireOrganizationContext() {
  const org = await getCurrentOrganization();

  if (!org) {
    // No organization selected, redirect to selection page
    redirect('/dashboard');
  }

  return org;
}

/**
 * Alternative: Redirect from old route to new route structure
 * Use: redirect(redirectToNewDashboardRoute('/dashboard/students'))
 */
export function redirectToNewDashboardRoute(oldPath: string): string {
  const orgId = getCookieSync('current-organization');
  if (!orgId) {
    return '/dashboard';
  }

  // Extract the segment after /dashboard
  const segment = oldPath.replace('/dashboard', '').replace(/^\//, '');
  return `/dashboard/${orgId}/${segment}`;
}

/**
 * Helper to get cookie value synchronously (for use in non-async contexts)
 * Note: This won't work in truly async contexts; use getCurrentOrganization instead
 */
function getCookieSync(name: string): string | null {
  // This is a placeholder - in practice, you'd need async context
  // For now, prefer using getCurrentOrganization() which is async
  return null;
}
