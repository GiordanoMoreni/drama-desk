import { redirect } from 'next/navigation';
import { getCurrentUser, getUserOrganizations, setCurrentOrganization } from '@/lib/auth';
import { getServices } from '@/lib/di';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default async function OrganizationSelectPage() {
  console.log('OrganizationSelectPage: Checking user...');
  const user = await getCurrentUser();

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
            <CardTitle>Welcome to Drama Desk!</CardTitle>
            <CardDescription>
              You are not a member of any theatre organizations yet.
              Create your first organization to get started.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Create Your Organization</h4>
                <p className="text-sm text-blue-700 mb-4">
                  As the first user, you'll be the administrator of your new theatre organization.
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
                    // For now, just log the error
                    // In production, you might want to show an error message
                  }
                }}>
                  <div className="space-y-3">
                    <div>
                      <label htmlFor="orgName" className="block text-sm font-medium text-gray-700 mb-1">
                        Organization Name
                      </label>
                      <input
                        type="text"
                        id="orgName"
                        name="orgName"
                        required
                        placeholder="My Theatre Company"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label htmlFor="orgSlug" className="block text-sm font-medium text-gray-700 mb-1">
                        Organization Slug
                      </label>
                      <input
                        type="text"
                        id="orgSlug"
                        name="orgSlug"
                        required
                        placeholder="my-theatre-company"
                        pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Used in URLs. Only lowercase letters, numbers, and hyphens.
                      </p>
                    </div>
                    <Button type="submit" className="w-full">
                      Create Organization
                    </Button>
                  </div>
                </form>
              </div>

              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">Or</p>
                <form action={async () => {
                  'use server';
                  // Create a demo organization for testing
                  const demoOrgId = `demo-org-${Date.now()}`;

                  console.log('Setting demo organization:', demoOrgId);

                  // Set the demo organization as current (without creating in DB)
                  await setCurrentOrganization(demoOrgId);

                  redirect('/dashboard');
                }}>
                  <Button type="submit" variant="outline" className="w-full mb-2">
                    Quick Demo (No Database)
                  </Button>
                </form>
                <a href="/">
                  <Button variant="outline" className="w-full">
                    Back to Home
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
          <CardTitle>Select Organization</CardTitle>
          <CardDescription>
            Choose which theatre organization you want to work with
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