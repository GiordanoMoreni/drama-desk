'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Student } from '@/domain/entities';
import { PaginatedResult } from '@/domain/repositories/base-repository';
import { CreateStudentFormData } from '@/lib/validations/student';
import { StudentForm } from '@/components/forms/student-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Mail, Phone } from 'lucide-react';
import { toast } from 'sonner';
import { t } from '@/lib/translations';

interface StudentsPageClientProps {
  initialStudents: PaginatedResult<Student>;
  organizationId: string;
}

export function StudentsPageClient({ initialStudents, organizationId }: StudentsPageClientProps) {
  const [students, setStudents] = useState(initialStudents);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleCreateStudent = async (data: CreateStudentFormData) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/students', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...data, organizationId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create student');
      }

      const newStudent = await response.json();
      setStudents(prev => ({
        ...prev,
        data: [newStudent, ...prev.data],
        total: prev.total + 1,
      }));

      setIsCreateDialogOpen(false);
      toast.success(t('students.studentCreatedSuccess'));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('errors.failedToCreate'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteStudent = async (studentId: string) => {
    if (!confirm(t('common.delete') + '?')) return;

    try {
      const response = await fetch(`/api/students/${studentId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete student');
      }

      setStudents(prev => ({
        ...prev,
        data: prev.data.filter(s => s.id !== studentId),
        total: prev.total - 1,
      }));

      toast.success(t('students.studentDeletedSuccess'));
    } catch (error) {
      toast.error(t('errors.failedToDelete'));
    }
  };

  const formatDate = (date?: Date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('it-IT');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('students.title')}</h1>
          <p className="text-gray-600">
            {t('students.description')}
          </p>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              {t('students.addNewStudent')}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <StudentForm
              onSubmit={handleCreateStudent}
              isLoading={isLoading}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t('students.totalStudents')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{students.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t('dashboard.activeStudents')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {students.data.filter(s => s.isActive).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t('auth.email')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {students.data.filter(s => s.email).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Students Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t('students.listStudents')}</CardTitle>
          <CardDescription>
            {t('students.listStudents')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {students.data.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {t('students.noStudents')}. {t('students.addNewStudent')} {t('common.cancel').toLowerCase()} {t('common.next').toLowerCase()}.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('students.firstName')}</TableHead>
                  <TableHead>{t('auth.email')}</TableHead>
                  <TableHead>Grade Level</TableHead>
                  <TableHead>{t('students.dateOfBirth')}</TableHead>
                  <TableHead>{t('students.status')}</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.data.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {student.firstName} {student.lastName}
                        </div>
                        {student.emergencyContactName && (
                          <div className="text-sm text-gray-500">
                            Emergency: {student.emergencyContactName}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {student.email && (
                          <div className="flex items-center text-sm">
                            <Mail className="h-3 w-3 mr-1" />
                            {student.email}
                          </div>
                        )}
                        {student.phone && (
                          <div className="flex items-center text-sm">
                            <Phone className="h-3 w-3 mr-1" />
                            {student.phone}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{student.gradeLevel || 'N/A'}</TableCell>
                    <TableCell>{formatDate(student.dateOfBirth)}</TableCell>
                    <TableCell>
                      <Badge variant={student.isActive ? 'default' : 'secondary'}>
                      {student.isActive ? t('common.edit') : 'Inattivo'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteStudent(student.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}