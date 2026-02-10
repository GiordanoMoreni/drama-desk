import { NextRequest, NextResponse } from 'next/server';
import { requireOrganization } from '@/lib/auth';
import { getServices, getStudentRepository } from '@/lib/di';
import { StudentService } from '@/application/services/student-service';
import { CreateStudentFormData } from '@/lib/validations/student';

export async function GET(request: NextRequest) {
  try {
    const { organization } = await requireOrganization();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || undefined;
    const isActive = searchParams.get('isActive') === 'true' ? true :
                    searchParams.get('isActive') === 'false' ? false : undefined;
    const classId = searchParams.get('classId') || undefined;

    if (classId) {
      const services = await getServices();
      const [studentsResult, enrollments] = await Promise.all([
        services.studentService.getStudents(
          organization.organizationId,
          { search, isActive },
          { page: 1, limit: 2000 }
        ),
        services.classService.getEnrollmentsByClass(organization.organizationId, classId),
      ]);

      const activeStudentIds = new Set(
        enrollments
          .filter((enrollment) => enrollment.status === 'active')
          .map((enrollment) => enrollment.studentId)
      );

      const filteredStudents = studentsResult.data.filter((student) => activeStudentIds.has(student.id));
      const offset = (page - 1) * limit;
      const paginatedData = filteredStudents.slice(offset, offset + limit);
      const total = filteredStudents.length;

      return NextResponse.json({
        data: paginatedData,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      });
    }

    const studentRepository = await getStudentRepository();
    const studentService = new StudentService(studentRepository);

    const result = await studentService.getStudents(organization.organizationId, {
      search,
      isActive,
    }, { page, limit });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching students:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { organization } = await requireOrganization();

    const body: CreateStudentFormData & { organizationId: string } = await request.json();

    // Validate that the organization ID matches
    if (body.organizationId !== organization.organizationId) {
      return NextResponse.json(
        { error: 'Organization ID mismatch' },
        { status: 403 }
      );
    }

    const { organizationId, ...studentData } = body;

    // Convert string dates to Date objects for compatibility with domain types
    const processedStudentData = {
      ...studentData,
      dateOfBirth: studentData.dateOfBirth ? new Date(studentData.dateOfBirth) : undefined,
    };

    const studentRepository = await getStudentRepository();
    const studentService = new StudentService(studentRepository);

    const student = await studentService.createStudent(processedStudentData, organizationId);

    return NextResponse.json(student, { status: 201 });
  } catch (error) {
    console.error('Error creating student:', error);

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
