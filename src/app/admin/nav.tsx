'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Building2,
  Users,
  BarChart3,
  Settings,
  UserPlus
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: BarChart3 },
  { name: 'Organizations', href: '/admin/organizations', icon: Building2 },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Invitations', href: '/admin/invitations', icon: UserPlus },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="w-64 bg-white shadow-sm border-r">
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Administration</h2>
        <ul className="space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  )}
                >
                  <item.icon className="h-5 w-5 mr-3" />
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}