import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { getServices } from '@/lib/di';

export async function GET() {
  try {
    // Only allow authenticated users to access admin data
    try {
      await requireAuth();
    } catch (error) {
      // If auth fails, return 401 instead of redirecting
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // For now, return mock data while we fix the database queries
    // TODO: Replace with real data from database
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

    return NextResponse.json(dashboardData);
  } catch (error) {
    console.error('Error fetching admin dashboard data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}