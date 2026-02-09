'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import {
  Users,
  Calendar,
  Theater,
  ChevronDown,
  LogOut,
  Home,
  Building
} from 'lucide-react';
import { t } from '@/lib/translations';

interface DashboardNavProps {
  organizationName: string;
  userEmail: string;
  userRole: 'admin' | 'teacher' | 'staff';
  userOrganizations: Array<{
    organizationId: string;
    organizationName: string;
    organizationSlug: string;
    userRole: 'admin' | 'teacher' | 'staff';
  }>;
}

const navigation = [
  { name: t('dashboard.title'), href: '/dashboard', icon: Home },
  { name: t('students.title'), href: '/dashboard/students', icon: Users },
  { name: t('classes.title'), href: '/dashboard/classes', icon: Calendar },
  { name: t('shows.title'), href: '/dashboard/shows', icon: Theater },
  { name: t('organizations.organizationName'), href: '/dashboard/organization', icon: Building },
];

export default function DashboardNav({
  organizationName,
  userEmail,
  userRole,
  userOrganizations,
}: DashboardNavProps) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      const response = await fetch('/api/auth/signout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        window.location.href = '/';
      } else {
        console.error('Failed to sign out');
      }
    } catch (error) {
      console.error('Error signing out:', error);
      // Fallback - redirect anyway
      window.location.href = '/';
    }
  };

  const switchOrganization = (organizationId: string) => {
    // This would typically be handled by a server action
    // For now, we'll use window.location which is allowed in client components
    window.location.href = `/organizations/switch?org=${organizationId}`;
  };

  return (
    <>
      {/* Top Navigation */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="flex items-center space-x-2">
                <Theater className="h-8 w-8 text-blue-600" />
                <span className="text-xl font-bold text-gray-900">Drama Desk</span>
              </Link>
              <div className="h-6 w-px bg-gray-300" />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2">
                    <span className="font-medium">{organizationName}</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  {userOrganizations.map((org) => (
                    <DropdownMenuItem
                      key={org.organizationId}
                      onClick={() => switchOrganization(org.organizationId)}
                      className="flex items-center justify-between min-w-[200px]"
                    >
                      <span>{org.organizationName}</span>
                      <Badge variant={org.userRole === 'admin' ? 'default' : 'secondary'}>
                        {org.userRole}
                      </Badge>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="flex items-center space-x-4">
              <Badge variant={userRole === 'admin' ? 'default' : 'secondary'}>
                {userRole}
              </Badge>
              <span className="text-sm text-gray-600 hidden sm:block">
                {userEmail}
              </span>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar Navigation */}
        <nav className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 md:pt-16">
          <div className="flex-1 flex flex-col min-h-0 bg-white border-r border-gray-200">
            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
              <div className="flex-1 px-2 space-y-1">
                {navigation.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                        isActive
                          ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <item.icon
                        className={`mr-3 h-5 w-5 flex-shrink-0 ${
                          isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                        }`}
                      />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </nav>

        {/* Mobile menu button */}
        <div className="md:hidden fixed top-16 left-0 right-0 z-50 bg-white border-b border-gray-200 px-4 py-2">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="flex items-center justify-between w-full"
          >
            <span className="text-sm font-medium">{t('common.next').toLowerCase()}</span>
            <ChevronDown className={`h-4 w-4 transition-transform ${isMobileMenuOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden fixed top-24 left-0 right-0 z-40 bg-white border-b border-gray-200">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`block px-3 py-2 rounded-md text-base font-medium ${
                      isActive
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <div className="flex items-center">
                      <item.icon className="mr-3 h-5 w-5" />
                      {item.name}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </>
  );
}