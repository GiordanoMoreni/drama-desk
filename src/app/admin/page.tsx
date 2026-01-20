import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, Users, UserPlus, Activity } from 'lucide-react';

// Fetch real admin dashboard data
async function getAdminDashboardData() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/admin/dashboard`, {
      cache: 'no-store', // Always fetch fresh data
    });

    if (!response.ok) {
      console.error('Failed to fetch admin dashboard data:', response.statusText);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching admin dashboard data:', error);
    return null;
  }
}

export default async function AdminDashboard() {
  const dashboardData = await getAdminDashboardData();

  const stats = [
    {
      name: 'Total Organizations',
      value: dashboardData?.totalOrganizations?.toString() || '0',
      description: 'Active theatre organizations',
      icon: Building2,
      color: 'text-blue-600',
    },
    {
      name: 'Total Users',
      value: dashboardData?.totalUsers?.toString() || '0',
      description: 'Registered users across all orgs',
      icon: Users,
      color: 'text-green-600',
    },
    {
      name: 'Pending Invitations',
      value: dashboardData?.pendingInvitations?.toString() || '0',
      description: 'Awaiting user acceptance',
      icon: UserPlus,
      color: 'text-orange-600',
    },
    {
      name: 'Active Sessions',
      value: dashboardData?.activeSessions?.toString() || '0',
      description: 'Users online right now',
      icon: Activity,
      color: 'text-purple-600',
    },
  ];

  const recentActivity = dashboardData?.recentActivity || [];
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Manage organizations, users, and system settings
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
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Latest administrative actions across the platform
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
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Recent Activity</h3>
              <p className="text-gray-600">
                Activity will appear here as organizations, classes, and shows are created.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common administrative tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-6 text-center">
                <Building2 className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <h3 className="font-medium text-gray-900">Create Organization</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Set up a new theatre organization
                </p>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-6 text-center">
                <UserPlus className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <h3 className="font-medium text-gray-900">Invite Users</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Send invitations to new users
                </p>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-6 text-center">
                <Users className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <h3 className="font-medium text-gray-900">Manage Users</h3>
                <p className="text-sm text-gray-600 mt-1">
                  View and manage all users
                </p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}