import { NextRequest, NextResponse } from 'next/server';
import { requireOrganization } from '@/lib/auth';
import { getStudentRepository } from '@/lib/di';
import { StudentService } from '@/application/services/student-service';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { organization } = await requireOrganization();
    const { id: studentId } = await params;

    const studentRepository = await getStudentRepository();
    const studentService = new StudentService(studentRepository);

    const student = await studentService.getStudentById(studentId, organization.organizationId);

    if (!student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(student);
  } catch (error) {
    console.error('Error fetching student:', error);
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

    const updateData = await request.json();

    // Convert string dates to Date objects for compatibility with domain types
    const processedUpdateData = {
      ...updateData,
      dateOfBirth: updateData.dateOfBirth ? new Date(updateData.dateOfBirth) : undefined,
    };

    const studentRepository = await getStudentRepository();
    const studentService = new StudentService(studentRepository);

    const student = await studentService.updateStudent(studentId, processedUpdateData, organization.organizationId);

    if (!student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(student);
  } catch (error) {
    console.error('Error updating student:', error);

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
    const { id: studentId } = await params;

    const studentRepository = await getStudentRepository();
    const studentService = new StudentService(studentRepository);

    const success = await studentService.deleteStudent(studentId, organization.organizationId);

    if (!success) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting student:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}