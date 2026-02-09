import { NextRequest, NextResponse } from 'next/server';
import { requireOrganization } from '@/lib/auth';
import { getServices } from '@/lib/di';
import { UpdateShowFormData } from '@/lib/validations/show';
import { ShowStaffAssignmentFormData } from '@/lib/validations/staff';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { organization } = await requireOrganization();
    const { id: showId } = await params;

    const services = await getServices();

    const show = await services.showService.getShowWithDirector(showId, organization.organizationId);

    if (!show) {
      return NextResponse.json(
        { error: 'Show not found' },
        { status: 404 }
      );
    }

    let staffAssignments: ShowStaffAssignmentFormData[] = [];
    try {
      const assignments = await services.staffService.getShowAssignments(organization.organizationId, showId);
      staffAssignments = assignments.map((assignment) => ({
        staffMemberId: assignment.staffMemberId,
        role: assignment.role,
        notes: assignment.notes,
      }));
    } catch (staffError) {
      // Keep show editing available even if staff assignment storage is not ready yet.
      console.warn('Error fetching show staff assignments:', staffError);
      staffAssignments = [];
    }

    return NextResponse.json({ ...show, staffAssignments });
  } catch (error) {
    console.error('Error fetching show:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { organization } = await requireOrganization();
    const { id: showId } = await params;

    const body: UpdateShowFormData & { staffAssignments?: ShowStaffAssignmentFormData[] } = await request.json();

    // Convert dates from strings to Date objects
    const processedBody = {
      ...body,
      startDate: body.startDate ? new Date(body.startDate) : undefined,
      endDate: body.endDate ? new Date(body.endDate) : undefined,
    };

    const services = await getServices();

    const updatedShow = await services.showService.updateShow(showId, processedBody, organization.organizationId);

    if (!updatedShow) {
      return NextResponse.json(
        { error: 'Show not found' },
        { status: 404 }
      );
    }

    if (body.staffAssignments !== undefined) {
      await services.staffService.replaceShowAssignments(
        organization.organizationId,
        showId,
        body.staffAssignments
      );
    }

    return NextResponse.json(updatedShow);
  } catch (error) {
    console.error('Error updating show:', error);

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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { organization } = await requireOrganization();
    const { id: showId } = await params;

    const services = await getServices();

    const deleted = await services.showService.deleteShow(showId, organization.organizationId);

    if (!deleted) {
      return NextResponse.json(
        { error: 'Show not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting show:', error);

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
