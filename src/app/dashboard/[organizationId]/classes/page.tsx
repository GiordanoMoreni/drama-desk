export const dynamic = 'force-dynamic';

import { ClassesPageClient } from '../../classes/client';

interface ClassesPageProps {
  params: Promise<{ organizationId: string }>;
}

export default async function ClassesPage({ params }: ClassesPageProps) {
  const { organizationId } = await params;

  return (
    <ClassesPageClient
      organizationId={organizationId}
    />
  );
}
