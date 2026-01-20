import { NextRequest, NextResponse } from 'next/server';
import { requireOrganization } from '@/lib/auth';
import { getServices } from '@/lib/di';
import { UpdateShowFormData } from '@/lib/validations/show';

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

    return NextResponse.json(show);
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

    const body: UpdateShowFormData = await request.json();

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