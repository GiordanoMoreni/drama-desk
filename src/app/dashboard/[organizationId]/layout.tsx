import { requireAuth, getUserOrganizations, setCurrentOrganization } from '@/lib/auth';
import DashboardNav from '../nav';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Shield, ArrowLeft } from 'lucide-react';
import { redirect } from 'next/navigation';

interface DashboardOrgLayoutProps {
  children: React.ReactNode;
  params: Promise<{ organizationId: string }>;
}

export default async function DashboardOrgLayout({
  children,
  params,
}: DashboardOrgLayoutProps) {
  const user = await requireAuth();
  const { organizationId } = await params;
  const userOrganizations = await getUserOrganizations(user.id);

  // Find the current organization
  const currentOrg = userOrganizations.find(org => org.organizationId === organizationId);

  if (!currentOrg) {
    redirect('/dashboard');
  }

  // Set the current organization in cookies
  await setCurrentOrganization(organizationId);

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNav
        organizationName={currentOrg.organizationName}
        userEmail={user.email}
        userRole={currentOrg.userRole}
        userOrganizations={userOrganizations}
      />

      {/* Admin Panel Access - Only for admins */}
      {currentOrg.userRole === 'admin' && (
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
