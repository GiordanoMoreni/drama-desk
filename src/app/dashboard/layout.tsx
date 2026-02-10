import { requireAuth } from '@/lib/auth';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* For dashboard root, don't show nav - it's handled in [organizationId] layout */}
      {/* This layout is used for /dashboard and /dashboard/[organizationId] */}
      {children}
    </div>
  );
}
