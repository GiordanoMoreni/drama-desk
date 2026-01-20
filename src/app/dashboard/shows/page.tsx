import { requireOrganization } from '@/lib/auth';
import { ShowsPageClient } from './client';

export default async function ShowsPage() {
  const { organization } = await requireOrganization();

  return (
    <ShowsPageClient
      organizationId={organization.organizationId}
    />
  );
}