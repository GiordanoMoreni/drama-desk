export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import { getCurrentUser, getUserOrganizations } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, ArrowRight, Building2 } from 'lucide-react';
import Link from 'next/link';
import DashboardNav from './nav';

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  const organizations = await getUserOrganizations(user.id);
  const currentOrg = organizations[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <DashboardNav
        organizationName={currentOrg?.organizationName || 'Le tue associazioni'}
        organizationId={currentOrg?.organizationId}
        userEmail={user.email}
        userRole={currentOrg?.userRole || 'staff'}
        userOrganizations={organizations}
        showSidebar={false}
        homeHref="/dashboard"
        profileHref={currentOrg ? `/dashboard/${currentOrg.organizationId}/profile` : '/dashboard/profile'}
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-24">
        {organizations.length > 0 ? (
          <div>
            <div className="mb-8">
              <div className="flex justify-end mb-6">
                <Link href="/organizations/select?from=dashboard">
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Nuova Associazione
                  </Button>
                </Link>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Seleziona un'associazione
              </h2>
              <p className="text-gray-600">
                Accedi al pannello di una delle tue associazioni teatrali
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {organizations.map((org) => (
                <Link
                  key={org.organizationId}
                  href={`/dashboard/${org.organizationId}`}
                >
                  <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer group">
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-xl group-hover:text-blue-600 transition-colors">
                            {org.organizationName}
                          </CardTitle>
                          <CardDescription className="text-sm mt-1">
                            Vai alla dashboard
                          </CardDescription>
                        </div>
                        <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-blue-100 text-blue-600 group-hover:bg-blue-200 transition-colors shrink-0">
                          <Building2 className="h-6 w-6" />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <Badge
                          variant={org.userRole === 'admin' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {org.userRole === 'admin' ? 'Amministratore' : org.userRole === 'teacher' ? 'Insegnante' : 'Staff'}
                        </Badge>
                        <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            {/* Create new org */}
            <div className="mt-12 pt-8 border-t">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Crea una nuova associazione
              </h3>
              <Link href="/organizations/select?from=dashboard">
                <Card className="border-2 border-dashed hover:border-blue-500 hover:bg-blue-50 transition-colors cursor-pointer">
                  <CardContent className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-lg bg-blue-100 text-blue-600 mb-4">
                        <Plus className="h-8 w-8" />
                      </div>
                      <h4 className="text-lg font-semibold text-gray-900">
                        Crea una nuova associazione
                      </h4>
                      <p className="text-gray-600 text-sm mt-1">
                        Fonda una nuova organizzazione teatrale
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>
        ) : (
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>Benvenuto in Drama Desk!</CardTitle>
              <CardDescription>
                Non sei ancora membro di nessuna organizzazione teatrale.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                Crea la tua prima associazione teatrale per iniziare a gestire lezioni, spettacoli e studenti.
              </p>
              <Link href="/organizations/select?from=dashboard" className="block">
                <Button className="w-full gap-2">
                  <Plus className="h-4 w-4" />
                  Crea la tua prima associazione
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
