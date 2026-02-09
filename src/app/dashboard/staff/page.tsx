export const dynamic = 'force-dynamic';

import { requireOrganization } from '@/lib/auth';
import { StaffPageClient } from './client';

export default async function StaffPage() {
  const { organization } = await requireOrganization();

  return <StaffPageClient organizationId={organization.organizationId} />;
}
