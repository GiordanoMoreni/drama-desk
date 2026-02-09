export const dynamic = 'force-dynamic';

import { requireAuth } from '@/lib/auth';
import { getStudentRepository } from '@/lib/di';
import { StudentService } from '@/application/services/student-service';
import { StudentsPageClient } from '../../students/client';

interface StudentsPageProps {
  params: Promise<{ organizationId: string }>;
}

export default async function StudentsPage({ params }: StudentsPageProps) {
  const { organizationId } = await params;
  await requireAuth();

  // Get dependencies
  const studentRepository = await getStudentRepository();
  const studentService = new StudentService(studentRepository);

  // Fetch initial data
  const students = await studentService.getStudents(organizationId);

  return (
    <StudentsPageClient
      initialStudents={students}
      organizationId={organizationId}
    />
  );
}
