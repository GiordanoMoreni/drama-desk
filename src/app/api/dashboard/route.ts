import { NextResponse } from 'next/server';
import { requireOrganization } from '@/lib/auth';
import { getServices } from '@/lib/di';
import { GetDashboardDataUseCase } from '@/application/use-cases/get-dashboard-data';

export async function GET() {
  let organization;

  try {
    const orgData = await requireOrganization();
    organization = orgData.organization;

    const services = await getServices();

    const dashboardUseCase = new GetDashboardDataUseCase(
      services.studentService,
      services.classService,
      services.showService
    );

    const dashboardData = await dashboardUseCase.execute(organization.organizationId);

    return NextResponse.json(dashboardData);
  } catch (error) {
    console.error('Error fetching dashboard data:', error);

    // For admin testing, return empty data instead of error
    if (organization?.organizationId.startsWith('admin-test-org-')) {
      const emptyDashboardData = {
        totalStudents: 0,
        activeClasses: 0,
        upcomingShows: 0,
        studentStats: {
          totalActive: 0,
          byGrade: {}
        },
        classStats: {
          totalActive: 0,
          totalEnrollments: 0
        },
        showStats: {
          totalActive: 0,
          planningShows: 0,
          rehearsingShows: 0,
          performingShows: 0
        },
        recentActivity: []
      };

      return NextResponse.json(emptyDashboardData);
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}