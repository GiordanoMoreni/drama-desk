import { NextRequest, NextResponse } from 'next/server';
import { requireOrganization } from '@/lib/auth';
import { getServices } from '@/lib/di';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { organization } = await requireOrganization();
    const { id: studentId } = await params;
    const services = await getServices();

    const enrollments = await services.classService.getEnrollmentsByStudent(
      organization.organizationId,
      studentId
    );

    const classIds = enrollments
      .filter((enrollment) => enrollment.status === 'active')
      .map((enrollment) => enrollment.classId);

    return NextResponse.json({ classIds });
  } catch (error) {
    console.error('Error fetching student classes:', error);
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
    const { id: studentId } = await params;
    const body = await request.json();
    const classIds: string[] = Array.isArray(body.classIds) ? body.classIds : [];
    const services = await getServices();

    const currentEnrollments = await services.classService.getEnrollmentsByStudent(
      organization.organizationId,
      studentId
    );

    const currentActive = currentEnrollments.filter((enrollment) => enrollment.status === 'active');
    const currentActiveClassIds = new Set(currentActive.map((enrollment) => enrollment.classId));
    const desiredClassIds = new Set(classIds);

    for (const enrollment of currentActive) {
      if (!desiredClassIds.has(enrollment.classId)) {
        await services.classService.updateClassEnrollment(
          enrollment.id,
          { status: 'dropped' },
          organization.organizationId
        );
      }
    }

    for (const classId of classIds) {
      if (!currentActiveClassIds.has(classId)) {
        await services.classService.enrollStudent(
          { classId, studentId },
          organization.organizationId
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating student classes:', error);
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
