import { requireAuth, getUserOrganizations, getCurrentOrganization } from '@/lib/auth';
import DashboardNav from '../nav';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Shield, AlertCircle } from 'lucide-react';

interface ProfileLayoutProps {
  children: React.ReactNode;
}

export default async function ProfileLayout({
  children,
}: ProfileLayoutProps) {
  const user = await requireAuth();
  const userOrganizations = await getUserOrganizations(user.id);
  const currentOrg = await getCurrentOrganization();

  // If no organization is selected, show a warning
  if (!currentOrg) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto p-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="h-6 w-6 text-yellow-600" />
              <h3 className="text-lg font-semibold text-yellow-900">Seleziona un'organizzazione</h3>
            </div>
            <p className="text-yellow-700 text-sm mb-4">
              Devi selezionare un'organizzazione prima di accedere a questa pagina.
            </p>
            <Link href="/dashboard">
              <Button className="w-full">
                Vai alla selezione organizzazioni
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

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
