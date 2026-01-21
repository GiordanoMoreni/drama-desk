import { redirect } from 'next/navigation';
import { getCurrentUser, getUserOrganizations, setCurrentOrganization } from '@/lib/auth';
import { getServices } from '@/lib/di';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface OrganizationSelectPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function OrganizationSelectPage({ searchParams }: OrganizationSelectPageProps) {
  console.log('OrganizationSelectPage: Checking user...');
  const user = await getCurrentUser();

  const params = await searchParams;
  const error = typeof params.error === 'string' ? params.error : null;

  if (!user) {
    console.log('OrganizationSelectPage: No user found, redirecting to login');
    redirect('/login');
  }

  console.log('OrganizationSelectPage: User found:', {
    id: user.id,
    email: user.email,
    user_metadata: user.user_metadata
  });

  const organizations = await getUserOrganizations(user.id);
  console.log('OrganizationSelectPage: Found organizations:', organizations.length, organizations);

  if (organizations.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Benvenuto in Drama Desk!</CardTitle>
            <CardDescription>
              Non sei ancora membro di nessuna organizzazione teatrale.
              Crea la tua prima organizzazione per iniziare.
            </CardDescription>
          </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Crea la Tua Organizzazione</h4>
                <p className="text-sm text-blue-700 mb-4">
                  Come primo utente, sarai l'amministratore della tua nuova organizzazione teatrale.
                </p>
                <form action={async (formData: FormData) => {
                  'use server';

                  const orgName = formData.get('orgName') as string;
                  const orgSlug = formData.get('orgSlug') as string;

                  if (!orgName?.trim()) {
                    console.error('Organization name is required');
                    return;
                  }

                  if (!orgSlug?.trim()) {
                    console.error('Organization slug is required');
                    return;
                  }

                  // Validate slug format
                  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
                  if (!slugRegex.test(orgSlug)) {
                    console.error('Invalid slug format');
                    return;
                  }

                  try {
                    // Get current user in server action context
                    const currentUser = await getCurrentUser();
                    if (!currentUser) {
                      console.error('No authenticated user found');
                      return;
                    }

                    console.log('Creating organization:', { name: orgName, slug: orgSlug, userId: currentUser.id });

                    // Create the organization in database
                    const services = await getServices();
                    const newOrg = await services.organizationService.createOrganization({
                      name: orgName.trim(),
                      slug: orgSlug.trim(),
                      description: `Theatre organization created by ${currentUser.email}`,
                      contactEmail: currentUser.email,
                    }, currentUser.id);

                    console.log('Organization created:', newOrg);

                    // Set the new organization as current
                    await setCurrentOrganization(newOrg.id);

                    redirect('/dashboard');
                  } catch (error) {
                    console.error('Error creating organization:', error);
                    const errorMessage = error instanceof Error ? error.message : 'Failed to create organization';
                    redirect(`/organizations/select?error=${encodeURIComponent(errorMessage)}`);
                  }
                }}>
                  <div className="space-y-3">
                    <div>
                      <label htmlFor="orgName" className="block text-sm font-medium text-gray-700 mb-1">
                        Nome Organizzazione
                      </label>
                      <input
                        type="text"
                        id="orgName"
                        name="orgName"
                        required
                        placeholder="La Mia Compagnia Teatrale"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label htmlFor="orgSlug" className="block text-sm font-medium text-gray-700 mb-1">
                        Slug Organizzazione
                      </label>
                      <input
                        type="text"
                        id="orgSlug"
                        name="orgSlug"
                        required
                        placeholder="la-mia-compagnia-teatrale"
                        pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Usato negli URL. Solo lettere minuscole, numeri e trattini.
                      </p>
                    </div>
                    <Button type="submit" className="w-full">
                      Crea Organizzazione
                    </Button>
                  </div>
                </form>
              </div>

              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">Oppure</p>
                <form action={async () => {
                  'use server';

                  try {
                    // Get current user in server action context
                    const currentUser = await getCurrentUser();
                    if (!currentUser) {
                      console.error('No authenticated user found for demo');
                      redirect('/organizations/select?error=No%20authenticated%20user%20found');
                    }

                    // Create a demo organization for testing
                    const demoSlug = `demo-org-${Date.now()}`;

                    console.log('Creating demo organization:', demoSlug);

                    // Create the demo organization in database
                    const services = await getServices();
                    const demoOrg = await services.organizationService.createOrganization({
                      name: 'Compagnia Teatrale Demo',
                      slug: demoSlug,
                      description: 'Organizzazione demo per testare Drama Desk',
                      contactEmail: currentUser.email,
                    }, currentUser.id);

                    console.log('Demo organization created:', demoOrg);

                    // Set the demo organization as current
                    await setCurrentOrganization(demoOrg.id);

                    redirect('/dashboard');
                  } catch (error) {
                    console.error('Error creating demo organization:', error);
                    const errorMessage = error instanceof Error ? error.message : 'Failed to create demo organization';
                    redirect(`/organizations/select?error=${encodeURIComponent(errorMessage)}`);
                  }
                }}>
                  <Button type="submit" variant="outline" className="w-full mb-2">
                    Demo Rapida
                  </Button>
                </form>
                <a href="/">
                  <Button variant="outline" className="w-full">
                    Torna alla Home
                  </Button>
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (organizations.length === 1) {
    // Auto-select if user only has one organization
    await setCurrentOrganization(organizations[0].organizationId);
    redirect('/dashboard');
  }

  async function selectOrganization(organizationId: string) {
    'use server';
    await setCurrentOrganization(organizationId);
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Seleziona Organizzazione</CardTitle>
          <CardDescription>
            Scegli con quale organizzazione teatrale vuoi lavorare
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {organizations.map((org) => (
            <form key={org.organizationId} action={async () => {
              'use server';
              await selectOrganization(org.organizationId);
            }}>
              <Button
                type="submit"
                variant="outline"
                className="w-full justify-between h-auto p-4"
              >
                <div className="text-left">
                  <div className="font-medium">{org.organizationName}</div>
                  <div className="text-sm text-muted-foreground">
                    {org.organizationSlug}
                  </div>
                </div>
                <Badge variant={org.userRole === 'admin' ? 'default' : 'secondary'}>
                  {org.userRole}
                </Badge>
              </Button>
            </form>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}