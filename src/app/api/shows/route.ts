import { NextRequest, NextResponse } from 'next/server';
import { requireOrganization } from '@/lib/auth';
import { getServices } from '@/lib/di';
import { CreateShowFormData } from '@/lib/validations/show';
import { ShowStaffAssignmentFormData } from '@/lib/validations/staff';

export async function GET(request: NextRequest) {
  try {
    const { organization } = await requireOrganization();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || undefined;
    const isActive = searchParams.get('isActive') === 'true' ? true :
                    searchParams.get('isActive') === 'false' ? false : undefined;
    const directorId = searchParams.get('directorId') || undefined;
    const status = searchParams.get('status') as 'planning' | 'rehearsing' | 'performing' | 'completed' | 'cancelled' | undefined;

    const services = await getServices();

    const result = await services.showService.getShows(organization.organizationId, {
      search,
      isActive,
      directorId,
      status,
    }, { page, limit });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching shows:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { organization } = await requireOrganization();

    const body: CreateShowFormData & {
      organizationId: string;
      staffAssignments?: ShowStaffAssignmentFormData[];
    } = await request.json();

    // Validate that the organization ID matches
    if (body.organizationId !== organization.organizationId) {
      return NextResponse.json(
        { error: 'Organization ID mismatch' },
        { status: 403 }
      );
    }

    const { organizationId, staffAssignments, ...showData } = body;

    // Convert dates from strings to Date objects
    const processedShowData = {
      ...showData,
      startDate: showData.startDate ? new Date(showData.startDate) : undefined,
      endDate: showData.endDate ? new Date(showData.endDate) : undefined,
    };

    const services = await getServices();

    const show = await services.showService.createShow(processedShowData, organizationId);
    if (staffAssignments) {
      await services.staffService.replaceShowAssignments(organizationId, show.id, staffAssignments);
    }

    return NextResponse.json(show, { status: 201 });
  } catch (error) {
    console.error('Error creating show:', error);

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
