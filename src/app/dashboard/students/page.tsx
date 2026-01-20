import { requireOrganization } from '@/lib/auth';
import { getStudentRepository } from '@/lib/di';
import { StudentService } from '@/application/services/student-service';
import { StudentsPageClient } from './client';

export default async function StudentsPage() {
  const { organization } = await requireOrganization();

  // Get dependencies
  const studentRepository = await getStudentRepository();
  const studentService = new StudentService(studentRepository);

  // Fetch initial data
  const students = await studentService.getStudents(organization.organizationId);

  return (
    <StudentsPageClient
      initialStudents={students}
      organizationId={organization.organizationId}
    />
  );
}