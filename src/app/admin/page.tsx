export const dynamic = 'force-dynamic';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, Users, UserPlus, Activity } from 'lucide-react';
import { requireAuth } from '@/lib/auth';
import { t } from '@/lib/translations';
import { createAdminClient } from '@/infrastructure/db/supabase/server-client';

interface RecentActivityItem {
  id: string;
  action: string;
  details: string;
  user: string;
  timestamp: string;
  timestampValue: number;
}

async function getAdminDashboardData() {
  try {
    await requireAuth();
    const supabase = await createAdminClient();

    const [
      { count: totalOrganizations },
      { count: totalUsers },
      { count: pendingInvitations },
      { count: activeUsers },
      { data: recentOrganizations },
      { data: recentInvitations },
      { data: recentClasses },
      { data: recentShows },
      { data: recentStudents },
    ] = await Promise.all([
      supabase.from('organizations').select('*', { count: 'exact', head: true }),
      supabase.from('organization_members').select('*', { count: 'exact', head: true }),
      supabase.from('organization_members').select('*', { count: 'exact', head: true }).is('joined_at', null),
      supabase.from('organization_members').select('*', { count: 'exact', head: true }).eq('is_active', true),
      supabase.from('organizations').select('id, name, contact_email, created_at').order('created_at', { ascending: false }).limit(8),
      supabase.from('organization_members').select('id, user_id, organization_id, invited_at').order('invited_at', { ascending: false }).limit(8),
      supabase.from('classes').select('id, name, organization_id, created_at').order('created_at', { ascending: false }).limit(8),
      supabase.from('shows').select('id, title, organization_id, created_at').order('created_at', { ascending: false }).limit(8),
      supabase.from('students').select('id, first_name, last_name, organization_id, created_at').order('created_at', { ascending: false }).limit(8),
    ]);

    const organizationIds = Array.from(
      new Set([
        ...(recentInvitations || []).map((item) => item.organization_id),
        ...(recentClasses || []).map((item) => item.organization_id),
        ...(recentShows || []).map((item) => item.organization_id),
        ...(recentStudents || []).map((item) => item.organization_id),
      ])
    );
    const userIds = Array.from(new Set((recentInvitations || []).map((item) => item.user_id)));

    const [{ data: organizations }, { data: profiles }] = await Promise.all([
      organizationIds.length > 0
        ? supabase.from('organizations').select('id, name').in('id', organizationIds)
        : Promise.resolve({ data: [] }),
      userIds.length > 0
        ? supabase.from('user_profiles').select('id, first_name, last_name, email').in('id', userIds)
        : Promise.resolve({ data: [] }),
    ]);

    const organizationMap = new Map((organizations || []).map((org) => [org.id, org.name]));
    const profileMap = new Map((profiles || []).map((profile) => [profile.id, profile]));
    const recentActivity: RecentActivityItem[] = [];

    (recentOrganizations || []).forEach((org) => {
      recentActivity.push({
        id: `org-${org.id}`,
        action: 'Organizzazione creata',
        details: org.name,
        user: org.contact_email || 'Sistema',
        timestamp: new Date(org.created_at).toLocaleString('it-IT'),
        timestampValue: new Date(org.created_at).getTime(),
      });
    });

    (recentInvitations || []).forEach((invitation) => {
      const profile = profileMap.get(invitation.user_id);
      const invitedUser = profile?.email || invitation.user_id;
      const organizationName = organizationMap.get(invitation.organization_id) || 'Organizzazione';
      recentActivity.push({
        id: `invite-${invitation.id}`,
        action: 'Utente invitato',
        details: `${invitedUser} -> ${organizationName}`,
        user: t('admin.adminLabel'),
        timestamp: new Date(invitation.invited_at).toLocaleString('it-IT'),
        timestampValue: new Date(invitation.invited_at).getTime(),
      });
    });

    (recentClasses || []).forEach((classItem) => {
      recentActivity.push({
        id: `class-${classItem.id}`,
        action: 'Classe creata',
        details: classItem.name,
        user: organizationMap.get(classItem.organization_id) || 'Sistema',
        timestamp: new Date(classItem.created_at).toLocaleString('it-IT'),
        timestampValue: new Date(classItem.created_at).getTime(),
      });
    });

    (recentShows || []).forEach((show) => {
      recentActivity.push({
        id: `show-${show.id}`,
        action: 'Spettacolo creato',
        details: show.title,
        user: organizationMap.get(show.organization_id) || 'Sistema',
        timestamp: new Date(show.created_at).toLocaleString('it-IT'),
        timestampValue: new Date(show.created_at).getTime(),
      });
    });

    (recentStudents || []).forEach((student) => {
      recentActivity.push({
        id: `student-${student.id}`,
        action: 'Studente aggiunto',
        details: `${student.first_name} ${student.last_name}`,
        user: organizationMap.get(student.organization_id) || 'Sistema',
        timestamp: new Date(student.created_at).toLocaleString('it-IT'),
        timestampValue: new Date(student.created_at).getTime(),
      });
    });

    return {
      totalOrganizations: totalOrganizations || 0,
      totalUsers: totalUsers || 0,
      pendingInvitations: pendingInvitations || 0,
      activeSessions: activeUsers || 0,
      recentActivity: recentActivity
        .sort((a, b) => b.timestampValue - a.timestampValue)
        .slice(0, 20),
    };
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
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">{activity.action}</Badge>
                      <span className="text-sm font-medium text-gray-900">
                        {activity.details}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {t('admin.by')} {activity.user}
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
    </div>
  );
}
