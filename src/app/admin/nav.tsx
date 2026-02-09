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
import { t } from '@/lib/translations';

const navigation = [
  { name: t('admin.adminDashboard'), href: '/admin', icon: BarChart3 },
  { name: t('organizations.title'), href: '/admin/organizations', icon: Building2 },
  { name: t('admin.totalUsers').replace('Utenti Totali', 'Utenti'), href: '/admin/users', icon: Users },
  { name: 'Inviti', href: '/admin/invitations', icon: UserPlus },
  { name: 'Impostazioni', href: '/admin/settings', icon: Settings },
];

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="w-64 bg-white shadow-sm border-r">
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('admin.adminDashboard')}</h2>
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