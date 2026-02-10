export const dynamic = 'force-dynamic';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Calendar, Theater, TrendingUp, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { requireAuth, getUserOrganizations } from '@/lib/auth';
import { getServices } from '@/lib/di';
import { t, interpolate } from '@/lib/translations';
import { redirect } from 'next/navigation';
import CalendarSection from '@/components/dashboard/calendar-section';

interface DashboardOrgPageProps {
  params: Promise<{ organizationId: string }>;
}

const ACTIVITY_TYPE_LABELS: Record<string, string> = {
  student_added: 'Studente aggiunto',
  class_created: 'Classe creata',
  show_scheduled: 'Spettacolo programmato',
  student_enrolled: 'Studente iscritto',
  role_created: 'Ruolo creato',
  casting_assigned: 'Casting assegnato',
};

async function getDashboardData(organizationId: string) {
  try {
    const services = await getServices();
    const dashboardData = await services.getDashboardData.execute(organizationId);
    return dashboardData;
  } catch (error) {
    console.error('Failed to get dashboard data:', error);
    return null;
  }
}

export default async function DashboardOrgPage({ params }: DashboardOrgPageProps) {
  const user = await requireAuth();
  const { organizationId } = await params;
  const userOrganizations = await getUserOrganizations(user.id);

  // Find the current organization
  const currentOrg = userOrganizations.find(org => org.organizationId === organizationId);

  if (!currentOrg) {
    redirect('/dashboard');
  }

  const dashboardData = await getDashboardData(organizationId) || {
    totalStudents: 0,
    activeClasses: 0,
    upcomingShows: 0,
    studentStats: { totalActive: 0, byGrade: {} },
    classStats: { totalActive: 0, totalEnrollments: 0 },
    showStats: { totalActive: 0, planningShows: 0, rehearsingShows: 0, performingShows: 0 },
    recentActivity: []
  };

  return (
    <>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900">{t('dashboard.title')}</h2>
        <p className="text-gray-600 mt-1">
          {interpolate(t('dashboard.welcome'), { organization: currentOrg.organizationName })}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('dashboard.totalStudents')}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData?.totalStudents || 0}</div>
            <p className="text-xs text-muted-foreground">
              {t('dashboard.activeStudents')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('dashboard.activeClasses')}</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData?.activeClasses || 0}</div>
            <p className="text-xs text-muted-foreground">
              {t('dashboard.classesRunning')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('dashboard.upcomingShows')}</CardTitle>
            <Theater className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData?.upcomingShows || 0}</div>
            <p className="text-xs text-muted-foreground">
              {t('dashboard.showsPlanning')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('dashboard.classEnrollments')}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData?.classStats?.totalEnrollments || 0}</div>
            <p className="text-xs text-muted-foreground">
              {t('dashboard.totalEnrollments')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Calendar Section */}
      <CalendarSection organizationId={organizationId} />

      {/* Additional Stats */}
      {dashboardData?.studentStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                {t('dashboard.studentDistribution')}
              </CardTitle>
              <CardDescription>
                {t('dashboard.breakdownByGrade')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(dashboardData.studentStats.byGrade).map(([grade, count]) => (
                  <div key={grade} className="flex justify-between items-center">
                    <span className="text-sm font-medium">{grade}</span>
                    <Badge variant="secondary">{String(count)}</Badge>
                  </div>
                ))}
                {Object.keys(dashboardData.studentStats.byGrade).length === 0 && (
                  <p className="text-sm text-muted-foreground">{t('common.noDataAvailable')}</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                {t('dashboard.recentActivity')}
              </CardTitle>
              <CardDescription>
                {t('dashboard.latestUpdates')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dashboardData.recentActivity.slice(0, 5).map((activity: any) => (
                  <div key={activity.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{activity.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {activity.timestamp.toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {ACTIVITY_TYPE_LABELS[activity.type] || activity.type}
                    </Badge>
                  </div>
                ))}
                {dashboardData.recentActivity.length === 0 && (
                  <p className="text-sm text-muted-foreground">{t('admin.noRecentActivity')}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>{t('dashboard.quickActions')}</CardTitle>
          <CardDescription>
            {t('dashboard.commonTasks')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button className="h-20 flex-col space-y-2" asChild>
              <a href={`/dashboard/${organizationId}/students`}>
                <Users className="h-6 w-6" />
                <span>{t('dashboard.manageStudents')}</span>
              </a>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2" asChild>
              <a href={`/dashboard/${organizationId}/classes`}>
                <Calendar className="h-6 w-6" />
                <span>{t('dashboard.manageClasses')}</span>
              </a>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2" asChild>
              <a href={`/dashboard/${organizationId}/shows`}>
                <Theater className="h-6 w-6" />
                <span>{t('dashboard.manageShows')}</span>
              </a>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2" asChild>
              <a href={`/dashboard/${organizationId}/organization`}>
                <Users className="h-6 w-6" />
                <span>{t('dashboard.organizationSettings')}</span>
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
