'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
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
  Building,
  User,
  Settings,
  Briefcase,
} from 'lucide-react';
import { t } from '@/lib/translations';

interface DashboardNavProps {
  organizationName: string;
  organizationId?: string;
  userEmail: string;
  userRole: 'admin' | 'teacher' | 'staff';
  userOrganizations: Array<{
    organizationId: string;
    organizationName: string;
    organizationSlug: string;
    userRole: 'admin' | 'teacher' | 'staff';
  }>;
}

const getNavigation = (organizationName: string, organizationId?: string) => {
  const baseHref = organizationId ? `/dashboard/${organizationId}` : '/dashboard';
  return [
    { name: t('dashboard.title'), href: baseHref, icon: Home },
    { name: t('students.title'), href: `${baseHref}/students`, icon: Users },
    { name: t('classes.title'), href: `${baseHref}/classes`, icon: Calendar },
    { name: t('shows.title'), href: `${baseHref}/shows`, icon: Theater },
    { name: t('staff.title'), href: `${baseHref}/staff`, icon: Briefcase },
    { name: t('organizations.title'), href: `${baseHref}/organization`, icon: Building },
  ];
};

export default function DashboardNav({
  organizationName,
  organizationId,
  userEmail,
  userRole,
  userOrganizations,
}: DashboardNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  // Fetch user profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/profile');
        if (res.ok) {
          const data = await res.json();
          const profile = data.profile || {};
          setFirstName(profile.first_name || '');
          setLastName(profile.last_name || '');
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
      }
    };
    fetchProfile();
  }, []);

  const handleSignOut = async () => {
    try {
      const response = await fetch('/api/auth/signout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        window.location.assign('/');
      } else {
        console.error('Failed to sign out');
      }
    } catch (error) {
      console.error('Error signing out:', error);
      // Fallback - redirect anyway
      window.location.assign('/');
    }
  };

  const switchOrganization = (newOrgId: string) => {
    // Navigate to the new organization's dashboard
    router.push(`/dashboard/${newOrgId}`);
  };

  return (
    <>
      {/* Top Navigation */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 gap-4">
            {/* Logo e Organization Name */}
            <div className="flex items-center gap-4 min-w-0">
              <Link href="/dashboard" className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
                <Theater className="h-8 w-8 text-blue-600 flex-shrink-0" />
                <span className="text-xl font-bold text-gray-900 hidden sm:inline">Drama Desk</span>
              </Link>
              <div className="h-6 w-px bg-gray-300 hidden sm:block" />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 cursor-pointer hidden sm:flex">
                    <span className="font-medium max-w-[200px] truncate">{organizationName}</span>
                    <ChevronDown className="h-4 w-4 flex-shrink-0" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  {userOrganizations.map((org) => (
                    <DropdownMenuItem
                      key={org.organizationId}
                      onClick={() => switchOrganization(org.organizationId)}
                      className="flex items-center justify-between min-w-[200px] cursor-pointer"
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

            {/* User Section */}
            <div className="flex items-center gap-2 ml-auto">
              <Badge variant={userRole === 'admin' ? 'default' : 'secondary'}>
                {userRole}
              </Badge>
              
              {/* User Dropdown Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="flex items-center gap-2 cursor-pointer">
                    <User className="h-4 w-4" />
                    <span className="text-sm text-gray-600 hidden sm:inline truncate max-w-[150px]">
                      {firstName && lastName ? `${firstName} ${lastName}` : userEmail}
                    </span>
                    <ChevronDown className="h-4 w-4 hidden sm:inline" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {(firstName || lastName) && (
                    <>
                      <DropdownMenuItem disabled className="text-sm font-medium text-gray-900">
                        {firstName} {lastName}
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuItem disabled className="text-xs text-gray-500">
                    {userEmail}
                  </DropdownMenuItem>
                  <div className="my-1 h-px bg-gray-200" />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/profile" className="cursor-pointer flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      <span>Il mio profilo</span>
                    </Link>
                  </DropdownMenuItem>
                  <div className="my-1 h-px bg-gray-200" />
                  <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                    <LogOut className="h-4 w-4 mr-2" />
                    <span>Esci</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
                {getNavigation(organizationName, organizationId).map((item) => {
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
              {getNavigation(organizationName, organizationId).map((item) => {
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
