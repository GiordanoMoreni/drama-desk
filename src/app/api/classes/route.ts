import { NextRequest, NextResponse } from 'next/server';
import { requireOrganization } from '@/lib/auth';
import { getServices } from '@/lib/di';
import { CreateClassFormData } from '@/lib/validations/class';

export async function GET(request: NextRequest) {
  try {
    const { organization } = await requireOrganization();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || undefined;
    const isActive = searchParams.get('isActive') === 'true' ? true :
                    searchParams.get('isActive') === 'false' ? false : undefined;
    const teacherId = searchParams.get('teacherId') || undefined;

    const services = await getServices();

    const result = await services.classService.getClasses(organization.organizationId, {
      search,
      isActive,
      teacherId,
    }, { page, limit });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching classes:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { organization } = await requireOrganization();

    const body: CreateClassFormData & { organizationId: string } = await request.json();

    // Validate that the organization ID matches
    if (body.organizationId !== organization.organizationId) {
      return NextResponse.json(
        { error: 'Organization ID mismatch' },
        { status: 403 }
      );
    }

    const { organizationId, ...classData } = body;

    // Convert dates from strings to Date objects
    const processedClassData = {
      ...classData,
      startDate: classData.startDate ? new Date(classData.startDate) : undefined,
      endDate: classData.endDate ? new Date(classData.endDate) : undefined,
    };

    const services = await getServices();

    const newClass = await services.classService.createClass(processedClassData, organizationId);

    return NextResponse.json(newClass, { status: 201 });
  } catch (error) {
    console.error('Error creating class:', error);

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