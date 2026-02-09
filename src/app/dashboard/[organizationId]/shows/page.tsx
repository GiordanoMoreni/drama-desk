export const dynamic = 'force-dynamic';

import { ShowsPageClient } from '../../shows/client';

interface ShowsPageProps {
  params: Promise<{ organizationId: string }>;
}

export default async function ShowsPage({ params }: ShowsPageProps) {
  const { organizationId } = await params;

  return (
    <ShowsPageClient
      organizationId={organizationId}
    />
  );
}
