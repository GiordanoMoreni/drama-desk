export const dynamic = 'force-dynamic';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, Users, UserPlus, Activity } from 'lucide-react';
import { requireAuth } from '@/lib/auth';
import { t } from '@/lib/translations';

// Server-side admin dashboard data (avoids using NEXT_PUBLIC_APP_URL)
async function getAdminDashboardData() {
  try {
    // Ensure user is authenticated for admin access
    await requireAuth();

    // For now return the same mock data as the api route; later we can
    // call admin services from `getAdminServices()` to fetch real metrics.
    const dashboardData = {
      totalOrganizations: 5,
      totalUsers: 23,
      pendingInvitations: 2,
      activeSessions: 8,
      recentActivity: [
        {
          id: '1',
          action: 'Organization Created',
          details: 'Springfield Community Theatre',
          user: 'admin@drama-desk.com',
          timestamp: new Date().toLocaleString(),
        },
        {
          id: '2',
          action: 'User Invited',
          details: 'john.doe@example.com → Downtown Players',
          user: 'admin@drama-desk.com',
          timestamp: new Date(Date.now() - 3600000).toLocaleString(), // 1 hour ago
        },
        {
          id: '3',
          action: 'Class Created',
          details: 'Advanced Acting Class',
          user: 'manager@riverside.com',
          timestamp: new Date(Date.now() - 7200000).toLocaleString(), // 2 hours ago
        },
      ],
    };

    return dashboardData;
  } catch (error) {
    console.error('Failed to get admin dashboard data:', error);
    return null;
  }
}

export default async function AdminDashboard() {
  const dashboardData = await getAdminDashboardData();

  const stats = [
    {
      name: t('admin.totalOrganizations'),
      value: dashboardData?.totalOrganizations?.toString() || '0',
      description: t('admin.activeTheatres'),
      icon: Building2,
      color: 'text-blue-600',
    },
    {
      name: t('admin.totalUsers'),
      value: dashboardData?.totalUsers?.toString() || '0',
      description: t('admin.registeredUsers'),
      icon: Users,
      color: 'text-green-600',
    },
    {
      name: t('admin.pendingInvitations'),
      value: dashboardData?.pendingInvitations?.toString() || '0',
      description: t('admin.awaitingAcceptance'),
      icon: UserPlus,
      color: 'text-orange-600',
    },
    {
      name: t('admin.activeSessions'),
      value: dashboardData?.activeSessions?.toString() || '0',
      description: t('admin.usersOnline'),
      icon: Activity,
      color: 'text-purple-600',
    },
  ];

  const recentActivity = dashboardData?.recentActivity || [];
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{t('admin.adminDashboard')}</h1>
        <p className="text-gray-600 mt-2">
          {t('admin.manageOrganizations')}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.name}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.name}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>{t('admin.recentActivity')}</CardTitle>
          <CardDescription>
            {t('admin.latestActions')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentActivity.length > 0 ? (
            <div className="space-y-4">
              {recentActivity.map((activity: any) => (
                <div key={activity.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">{activity.action}</Badge>
                      <span className="text-sm font-medium text-gray-900">
                        {activity.details}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      by {activity.user}
                    </p>
                  </div>
                  <div className="text-sm text-gray-500">
                    {activity.timestamp}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">{t('admin.noRecentActivity')}</h3>
              <p className="text-gray-600">
                {t('admin.activityWilAppear')}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>{t('admin.quickActions')}</CardTitle>
          <CardDescription>
            {t('admin.commonAdminTasks')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-6 text-center">
                <Building2 className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <h3 className="font-medium text-gray-900">{t('admin.createOrganization')}</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {t('admin.setupNewTheatre')}
                </p>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-6 text-center">
                <UserPlus className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <h3 className="font-medium text-gray-900">{t('admin.inviteUsers')}</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {t('admin.sendInvitations')}
                </p>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-6 text-center">
                <Users className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <h3 className="font-medium text-gray-900">{t('admin.manageUsers')}</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {t('admin.viewManageAllUsers')}
                </p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
