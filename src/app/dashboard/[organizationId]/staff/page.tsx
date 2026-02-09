export const dynamic = 'force-dynamic';

import { StaffPageClient } from '../../staff/client';

interface StaffPageProps {
  params: Promise<{ organizationId: string }>;
}

export default async function StaffPage({ params }: StaffPageProps) {
  const { organizationId } = await params;
  return <StaffPageClient organizationId={organizationId} />;
}
