'use client';

import { useEffect, useMemo, useState } from 'react';
import { Student, Class } from '@/domain/entities';
import { PaginatedResult } from '@/domain/repositories/base-repository';
import { CreateStudentFormData } from '@/lib/validations/student';
import { StudentForm } from '@/components/forms/student-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Edit, Trash2, Mail, Phone, Search } from 'lucide-react';
import { toast } from 'sonner';
import { t } from '@/lib/translations';

interface StudentsPageClientProps {
  initialStudents: PaginatedResult<Student>;
  organizationId: string;
}

interface ClassesResponse {
  data: Class[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function StudentsPageClient({ initialStudents, organizationId }: StudentsPageClientProps) {
  const [students, setStudents] = useState(initialStudents);
  const [classes, setClasses] = useState<Class[]>([]);
  const [studentClassMap, setStudentClassMap] = useState<Record<string, string[]>>({});
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [selectedClassIds, setSelectedClassIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [classFilter, setClassFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    fetchStudents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, classFilter, statusFilter]);

  useEffect(() => {
    if (students.data.length > 0) {
      fetchStudentClassAssignments(students.data.map((student) => student.id));
    }
  }, [students.data]);

  const classNameById = useMemo(() => {
    const map = new Map<string, string>();
    classes.forEach((classItem) => map.set(classItem.id, classItem.name));
    return map;
  }, [classes]);

  const fetchClasses = async () => {
    try {
      const response = await fetch('/api/classes?limit=500&isActive=true');
      if (!response.ok) throw new Error('Failed to fetch classes');
      const data: ClassesResponse = await response.json();
      setClasses(data.data);
    } catch (error) {
      console.error('Error fetching classes:', error);
      setClasses([]);
    }
  };

  const fetchStudents = async () => {
    try {
      const params = new URLSearchParams();
      params.append('limit', '200');
      if (searchTerm) params.append('search', searchTerm);
      if (classFilter !== 'all') params.append('classId', classFilter);
      if (statusFilter !== 'all') params.append('isActive', String(statusFilter === 'active'));

      const response = await fetch(`/api/students?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch students');
      const data: PaginatedResult<Student> = await response.json();
      setStudents(data);
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error(t('errors.failedToFetch'));
    }
  };

  const fetchStudentClassAssignments = async (studentIds: string[]) => {
    try {
      const assignments = await Promise.all(
        studentIds.map(async (studentId) => {
          const response = await fetch(`/api/students/${studentId}/classes`);
          if (!response.ok) return { studentId, classIds: [] as string[] };
          const data = await response.json();
          return { studentId, classIds: data.classIds || [] };
        })
      );

      const nextMap: Record<string, string[]> = {};
      assignments.forEach(({ studentId, classIds }) => {
        nextMap[studentId] = classIds;
      });
      setStudentClassMap((prev) => ({ ...prev, ...nextMap }));
    } catch (error) {
      console.error('Error fetching student class assignments:', error);
    }
  };

  const saveStudentClasses = async (studentId: string, classIds: string[]) => {
    const response = await fetch(`/api/students/${studentId}/classes`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ classIds }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Errore aggiornamento classi studente');
    }

    setStudentClassMap((prev) => ({ ...prev, [studentId]: classIds }));
  };

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

      const newStudent: Student = await response.json();
      await saveStudentClasses(newStudent.id, selectedClassIds);
      await fetchStudents();

      setIsCreateDialogOpen(false);
      setSelectedClassIds([]);
      toast.success(t('students.studentCreatedSuccess'));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('errors.failedToCreate'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStudent = async (data: CreateStudentFormData) => {
    if (!editingStudent) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/students/${editingStudent.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Errore aggiornamento studente');
      }

      const updatedStudent: Student = await response.json();
      await saveStudentClasses(updatedStudent.id, selectedClassIds);
      await fetchStudents();

      setEditingStudent(null);
      setSelectedClassIds([]);
      toast.success(t('students.studentUpdatedSuccess'));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('errors.failedToUpdate'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartEdit = async (student: Student) => {
    setEditingStudent(student);
    try {
      const response = await fetch(`/api/students/${student.id}/classes`);
      if (!response.ok) throw new Error('Failed to fetch assigned classes');
      const data = await response.json();
      setSelectedClassIds(data.classIds || []);
    } catch {
      setSelectedClassIds([]);
      toast.error('Impossibile caricare le classi assegnate');
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
      await fetchStudents();

      toast.success(t('students.studentDeletedSuccess'));
    } catch {
      toast.error(t('errors.failedToDelete'));
    }
  };

  const formatDate = (date?: Date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('it-IT');
  };

  const renderClassAssignmentSelector = () => (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Assegna alle classi</CardTitle>
        <CardDescription>
          Seleziona una o più classi per questo studente.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 max-h-52 overflow-y-auto">
        {classes.length === 0 && (
          <p className="text-sm text-muted-foreground">Nessuna classe disponibile.</p>
        )}
        {classes.map((classItem) => (
          <label key={classItem.id} className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={selectedClassIds.includes(classItem.id)}
              onCheckedChange={(checked) => {
                setSelectedClassIds((prev) =>
                  checked
                    ? [...prev, classItem.id]
                    : prev.filter((id) => id !== classItem.id)
                );
              }}
            />
            <span>{classItem.name}</span>
          </label>
        ))}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('students.title')}</h1>
          <p className="text-gray-600">{t('students.description')}</p>
        </div>

        <Dialog
          open={isCreateDialogOpen}
          onOpenChange={(open) => {
            setIsCreateDialogOpen(open);
            if (!open) setSelectedClassIds([]);
          }}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              {t('students.addNewStudent')}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogTitle>{t('students.addNewStudent')}</DialogTitle>
            <StudentForm
              onSubmit={handleCreateStudent}
              isLoading={isLoading}
              submitLabel="Crea studente"
            />
            {renderClassAssignmentSelector()}
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-10"
                placeholder="Cerca per nome, cognome o email"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="px-3 py-2 border rounded-md text-sm"
            >
              <option value="all">Tutte le classi</option>
              {classes.map((classItem) => (
                <option key={classItem.id} value={classItem.id}>
                  {classItem.name}
                </option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
              className="px-3 py-2 border rounded-md text-sm"
            >
              <option value="all">Tutti gli stati</option>
              <option value="active">Attivi</option>
              <option value="inactive">Inattivi</option>
            </select>
          </div>
        </CardContent>
      </Card>

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

      <Card>
        <CardHeader>
          <CardTitle>{t('students.listStudents')}</CardTitle>
          <CardDescription>{t('students.listStudents')}</CardDescription>
        </CardHeader>
        <CardContent>
          {students.data.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {t('students.noStudents')}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('students.firstName')}</TableHead>
                  <TableHead>{t('auth.email')}</TableHead>
                  <TableHead>Classi</TableHead>
                  <TableHead>{t('students.dateOfBirth')}</TableHead>
                  <TableHead>{t('students.status')}</TableHead>
                  <TableHead className="w-[120px]">Azioni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.data.map((student) => {
                  const assignedClassIds = studentClassMap[student.id] || [];
                  const assignedClassNames = assignedClassIds
                    .map((classId) => classNameById.get(classId))
                    .filter(Boolean) as string[];

                  return (
                    <TableRow key={student.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {student.firstName} {student.lastName}
                          </div>
                          {student.emergencyContactName && (
                            <div className="text-sm text-gray-500">
                              Contatto emergenza: {student.emergencyContactName}
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
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {assignedClassNames.length > 0 ? (
                            assignedClassNames.slice(0, 2).map((className) => (
                              <Badge key={`${student.id}-${className}`} variant="outline">
                                {className}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-xs text-muted-foreground">Nessuna classe</span>
                          )}
                          {assignedClassNames.length > 2 && (
                            <Badge variant="secondary">+{assignedClassNames.length - 2}</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(student.dateOfBirth)}</TableCell>
                      <TableCell>
                        <Badge variant={student.isActive ? 'default' : 'secondary'}>
                          {student.isActive ? 'Attivo' : 'Inattivo'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm" onClick={() => handleStartEdit(student)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteStudent(student.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={!!editingStudent}
        onOpenChange={(open) => {
          if (!open) {
            setEditingStudent(null);
            setSelectedClassIds([]);
          }
        }}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogTitle>{t('students.editStudent')}</DialogTitle>
          {editingStudent && (
            <>
              <StudentForm
                onSubmit={handleUpdateStudent}
                isLoading={isLoading}
                title={t('students.editStudent')}
                description={t('students.description')}
                defaultValues={{
                  firstName: editingStudent.firstName,
                  lastName: editingStudent.lastName,
                  email: editingStudent.email || '',
                  phone: editingStudent.phone || '',
                  dateOfBirth: editingStudent.dateOfBirth ? new Date(editingStudent.dateOfBirth).toISOString().split('T')[0] : '',
                  gradeLevel: editingStudent.gradeLevel || '',
                  emergencyContactName: editingStudent.emergencyContactName || '',
                  emergencyContactPhone: editingStudent.emergencyContactPhone || '',
                  medicalInfo: editingStudent.medicalInfo || '',
                  notes: editingStudent.notes || '',
                }}
                submitLabel="Aggiorna studente"
                resetOnSubmit={false}
              />
              {renderClassAssignmentSelector()}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
