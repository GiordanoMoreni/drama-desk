import { requireAuth, getUserOrganizations } from '@/lib/auth';
import DashboardNav from './nav';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Shield } from 'lucide-react';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAuth();
  const userOrganizations = await getUserOrganizations(user.id);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* For dashboard root, don't show nav - it's handled in [organizationId] layout */}
      {/* This layout is used for /dashboard and /dashboard/[organizationId] */}
      {children}
    </div>
  );
}