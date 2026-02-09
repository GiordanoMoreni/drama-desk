'export const dynamic = 'force-dynamic';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Calendar, Theater, TrendingUp, Clock } from 'lucide-react';
import { requireOrganization } from '@/lib/auth';
import { getServices } from '@/lib/di';

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

export default async function DashboardPage() {
  const { organization } = await requireOrganization();
  const dashboardData = await getDashboardData(organization.organizationId) || {
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
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <p className="text-gray-600">
          Welcome to {organization.organizationName}
        </p>
      </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData?.totalStudents || 0}</div>
              <p className="text-xs text-muted-foreground">
                Active students in your organization
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Classes</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData?.activeClasses || 0}</div>
              <p className="text-xs text-muted-foreground">
                Classes currently running
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming Shows</CardTitle>
              <Theater className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData?.upcomingShows || 0}</div>
              <p className="text-xs text-muted-foreground">
                Shows in planning or production
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Class Enrollments</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData?.classStats?.totalEnrollments || 0}</div>
              <p className="text-xs text-muted-foreground">
                Total student enrollments
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Additional Stats */}
        {dashboardData?.studentStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Student Distribution by Grade
                </CardTitle>
                <CardDescription>
                  Breakdown of active students by grade level
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
                    <p className="text-sm text-muted-foreground">No grade data available</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
                <CardDescription>
                  Latest updates in your organization
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
                        {activity.type.replace('_', ' ')}
                      </Badge>
                    </div>
                  ))}
                  {dashboardData.recentActivity.length === 0 && (
                    <p className="text-sm text-muted-foreground">No recent activity</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks for managing your theatre organization
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button className="h-20 flex-col space-y-2" asChild>
                <a href="/dashboard/students">
                  <Users className="h-6 w-6" />
                  <span>Manage Students</span>
                </a>
              </Button>
              <Button variant="outline" className="h-20 flex-col space-y-2" asChild>
                <a href="/dashboard/classes">
                  <Calendar className="h-6 w-6" />
                  <span>Manage Classes</span>
                </a>
              </Button>
              <Button variant="outline" className="h-20 flex-col space-y-2" asChild>
                <a href="/dashboard/shows">
                  <Theater className="h-6 w-6" />
                  <span>Manage Shows</span>
                </a>
              </Button>
              <Button variant="outline" className="h-20 flex-col space-y-2" asChild>
                <a href="/dashboard/organization">
                  <Users className="h-6 w-6" />
                  <span>Organization Settings</span>
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
    </>
  );
}