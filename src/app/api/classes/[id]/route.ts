import { NextRequest, NextResponse } from 'next/server';
import { requireOrganization } from '@/lib/auth';
import { getServices } from '@/lib/di';
import { UpdateClassFormData } from '@/lib/validations/class';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { organization } = await requireOrganization();
    const { id: classId } = await params;

    const services = await getServices();

    const classData = await services.classService.getClassWithTeacher(classId, organization.organizationId);

    if (!classData) {
      return NextResponse.json(
        { error: 'Class not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(classData);
  } catch (error) {
    console.error('Error fetching class:', error);
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
    const { id: classId } = await params;

    const body: UpdateClassFormData = await request.json();

    // Convert dates from strings to Date objects
    const processedBody = {
      ...body,
      startDate: body.startDate ? new Date(body.startDate) : undefined,
      endDate: body.endDate ? new Date(body.endDate) : undefined,
    };

    const services = await getServices();

    const updatedClass = await services.classService.updateClass(classId, processedBody, organization.organizationId);

    if (!updatedClass) {
      return NextResponse.json(
        { error: 'Class not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedClass);
  } catch (error) {
    console.error('Error updating class:', error);

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
    const { id: classId } = await params;

    const services = await getServices();

    const deleted = await services.classService.deleteClass(classId, organization.organizationId);

    if (!deleted) {
      return NextResponse.json(
        { error: 'Class not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting class:', error);

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