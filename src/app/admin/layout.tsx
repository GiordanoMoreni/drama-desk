import { requireAuth } from '@/lib/auth';
import AdminNav from './nav';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Shield } from 'lucide-react';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Only allow authenticated users to access admin
  const user = await requireAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div className="flex items-center space-x-2">
                <Shield className="h-6 w-6 text-red-600" />
                <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              Logged in as: {user.email}
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <AdminNav />

        {/* Main Content */}
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}