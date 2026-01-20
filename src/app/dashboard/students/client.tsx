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
      toast.success('Student created successfully!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create student');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteStudent = async (studentId: string) => {
    if (!confirm('Are you sure you want to delete this student?')) return;

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

      toast.success('Student deleted successfully!');
    } catch (error) {
      toast.error('Failed to delete student');
    }
  };

  const formatDate = (date?: Date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Students</h1>
          <p className="text-gray-600">
            Manage students in your theatre organization
          </p>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Student
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
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{students.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {students.data.filter(s => s.isActive).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">With Email</CardTitle>
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
          <CardTitle>All Students</CardTitle>
          <CardDescription>
            A list of all students in your organization
          </CardDescription>
        </CardHeader>
        <CardContent>
          {students.data.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No students found. Add your first student to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Grade Level</TableHead>
                  <TableHead>Date of Birth</TableHead>
                  <TableHead>Status</TableHead>
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
                        {student.isActive ? 'Active' : 'Inactive'}
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