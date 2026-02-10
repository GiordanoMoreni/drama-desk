import { requireAuth } from '@/lib/auth';
import DashboardNav, { NavItem } from '@/app/dashboard/nav';
import { getUserOrganizations, getCurrentOrganization } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { t } from '@/lib/translations';

const adminNavigation: NavItem[] = [
  { name: t('admin.adminDashboard'), href: '/admin', icon: 'bar_chart_3' },
  { name: t('admin.organizationsNav'), href: '/admin/organizations', icon: 'building' },
  { name: t('admin.usersNav'), href: '/admin/users', icon: 'users' },
  { name: t('admin.invitationsNav'), href: '/admin/invitations', icon: 'user_plus' },
  { name: t('admin.settingsNav'), href: '/admin/settings', icon: 'settings' },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAuth();
  const userOrganizations = await getUserOrganizations(user.id);
  const currentOrganization = await getCurrentOrganization();
  const fallbackOrganization = userOrganizations[0];

  if (!fallbackOrganization) {
    redirect('/organizations/select');
  }

  const organizationName = currentOrganization?.organizationName || fallbackOrganization.organizationName;
  const organizationId = currentOrganization?.organizationId || fallbackOrganization.organizationId;
  const userRole = currentOrganization?.userRole || fallbackOrganization.userRole;

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNav
        organizationName={organizationName}
        organizationId={organizationId}
        userEmail={user.email}
        userRole={userRole}
        userOrganizations={userOrganizations}
        navigationItems={adminNavigation}
        homeHref="/dashboard"
        profileHref={organizationId ? `/dashboard/${organizationId}/profile` : '/dashboard/profile'}
      />

      <main className="md:pl-64 pt-16 md:pt-0">
        <div className="py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {children}
          </div>
        </div>
      </main>
    </div>
  );
}
