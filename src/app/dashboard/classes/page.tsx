export const dynamic = 'force-dynamic';

import { requireOrganization } from '@/lib/auth';
import { ClassesPageClient } from './client';

export default async function ClassesPage() {
  const { organization } = await requireOrganization();

  return (
    <ClassesPageClient
      organizationId={organization.organizationId}
    />
  );
}