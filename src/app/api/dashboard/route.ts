import { NextResponse } from 'next/server';
import { requireOrganization } from '@/lib/auth';
import { getServices } from '@/lib/di';

export async function GET() {
  console.log('=== DASHBOARD API START ===');

  try {
    const orgData = await requireOrganization();
    console.log('Organization retrieved:', orgData.organization.organizationId);

    console.log('Getting services...');
    const services = await getServices();
    console.log('Services loaded successfully');

    // Return static data for now
    const dashboardData = {
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

    console.log('=== DASHBOARD API SUCCESS ===');
    return NextResponse.json(dashboardData);
  } catch (error) {
    console.error('=== DASHBOARD API ERROR ===');
    console.error('Error:', error instanceof Error ? error.message : error);

    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}