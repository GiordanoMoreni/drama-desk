import { requireOrganization, getUserOrganizations } from '@/lib/auth';
import DashboardNav from './nav';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Shield } from 'lucide-react';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, organization } = await requireOrganization();
  const userOrganizations = await getUserOrganizations(user.id);

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNav
        organizationName={organization.organizationName}
        userEmail={user.email}
        userRole={organization.userRole}
        userOrganizations={userOrganizations}
      />

      {/* Admin Panel Access - Only for admins */}
      {organization.userRole === 'admin' && (
        <div className="bg-blue-600 text-white md:ml-64">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4" />
                <span className="text-sm font-medium">Admin Access</span>
              </div>
              <Link href="/admin">
                <Button variant="secondary" size="sm" className="cursor-pointer">
                  Admin Panel
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
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