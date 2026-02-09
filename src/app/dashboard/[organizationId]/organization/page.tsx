export const dynamic = 'force-dynamic';

import { requireAuth, getUserOrganizations } from '@/lib/auth';
import { getOrganizationRepository } from '@/lib/di';
import { OrganizationService } from '@/application/services/organization-service';
import { OrganizationPageClient } from '../../organization/client';

interface OrganizationPageProps {
  params: Promise<{ organizationId: string }>;
}

export default async function OrganizationPage({ params }: OrganizationPageProps) {
  const { organizationId } = await params;
  const user = await requireAuth();
  const userOrganizations = await getUserOrganizations(user.id);

  // Find current org to get user role
  const currentOrg = userOrganizations.find(org => org.organizationId === organizationId);
  const isAdmin = currentOrg?.userRole === 'admin';

  // Get organization details
  const organizationRepository = await getOrganizationRepository();
  const organizationService = new OrganizationService(organizationRepository);

  const org = await organizationService.getOrganizationById(
    organizationId,
    organizationId
  );

  if (!org) {
    return <div>Organization not found</div>;
  }

  return (
    <OrganizationPageClient
      organization={org}
      isAdmin={isAdmin}
    />
  );
}
