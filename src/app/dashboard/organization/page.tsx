export const dynamic = 'force-dynamic';

import { requireOrganization } from '@/lib/auth';
import { getOrganizationRepository } from '@/lib/di';
import { OrganizationService } from '@/application/services/organization-service';
import { OrganizationPageClient } from './client';

export default async function OrganizationPage() {
  const { organization } = await requireOrganization();

  // Get organization details
  const organizationRepository = await getOrganizationRepository();
  const organizationService = new OrganizationService(organizationRepository);

  const org = await organizationService.getOrganizationById(
    organization.organizationId,
    organization.organizationId
  );

  if (!org) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Organizzazione</h1>
          <p className="text-gray-600 mt-2">Organizzazione non trovata</p>
        </div>
      </div>
    );
  }

  return (
    <OrganizationPageClient
      organization={org}
      isAdmin={organization.userRole === 'admin'}
    />
  );
}
