'use client';

import { useState, useEffect } from 'react';
import { Class, OrganizationMember } from '@/domain/entities';
import { CreateClassFormData, UpdateClassFormData } from '@/lib/validations/class';
import { ClassForm } from '@/components/forms/class-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Plus, Edit, Trash2, Users, Search } from 'lucide-react';
import { toast } from 'sonner';
import { t } from '@/lib/translations';

interface ClassesPageClientProps {
  organizationId: string;
}

interface ClassesResponse {
  data: Class[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function ClassesPageClient({ organizationId }: ClassesPageClientProps) {
  const [classes, setClasses] = useState<Class[]>([]);
  const [teachers, setTeachers] = useState<OrganizationMember[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isActiveFilter, setIsActiveFilter] = useState<boolean | undefined>(true);

  // Fetch classes and teachers on mount
  useEffect(() => {
    fetchClasses();
    fetchTeachers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organizationId, searchTerm, isActiveFilter]);

  const fetchClasses = async () => {
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (isActiveFilter !== undefined) params.append('isActive', isActiveFilter.toString());

      const response = await fetch(`/api/classes?${params}`);
      if (!response.ok) throw new Error('Failed to fetch classes');

      const data: ClassesResponse = await response.json();
      setClasses(data.data);
    } catch (error) {
      console.error('Error fetching classes:', error);
      toast.error(t('errors.failedToFetch'));
    }
  };

  const fetchTeachers = async () => {
    try {
      // For now, we'll fetch organization members with teacher/staff roles
      // This should be replaced with a proper API endpoint
      const response = await fetch('/api/organizations/members');
      if (!response.ok) throw new Error('Failed to fetch teachers');

      const data = await response.json();
      setTeachers(data.filter((member: OrganizationMember) =>
        member.role === 'teacher' || member.role === 'staff'
      ));
    } catch (error) {
      console.error('Error fetching teachers:', error);
      // For demo purposes, we'll use empty array
      setTeachers([]);
    }
  };

  const handleCreateClass = async (data: CreateClassFormData | UpdateClassFormData) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/classes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...data, organizationId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create class');
      }

      const newClass = await response.json();
      setClasses(prev => [newClass, ...prev]);
      setIsCreateDialogOpen(false);
      toast.success(t('classes.classCreatedSuccess'));
    } catch (error) {
      console.error('Error creating class:', error);
      toast.error(error instanceof Error ? error.message : t('errors.failedToCreate'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateClass = async (data: CreateClassFormData | UpdateClassFormData) => {
    if (!editingClass) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/classes/${editingClass.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update class');
      }

      const updatedClass = await response.json();
      setClasses(prev => prev.map(c => c.id === updatedClass.id ? updatedClass : c));
      setEditingClass(null);
      toast.success(t('classes.classUpdatedSuccess'));
    } catch (error) {
      console.error('Error updating class:', error);
      toast.error(error instanceof Error ? error.message : t('errors.failedToUpdate'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClass = async (classId: string) => {
    if (!confirm(t('common.delete') + '?')) return;

    try {
      const response = await fetch(`/api/classes/${classId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete class');
      }

      setClasses(prev => prev.filter(c => c.id !== classId));
      toast.success(t('classes.classDeletedSuccess'));
    } catch (error) {
      console.error('Error deleting class:', error);
      toast.error(error instanceof Error ? error.message : t('errors.failedToDelete'));
    }
  };

  const formatSchedule = (schedule: any) => {
    if (!schedule) return t('common.loading');

    const days = schedule.days?.map((day: string) => day.charAt(0).toUpperCase() + day.slice(1)).join(', ') || '';
    const time = schedule.startTime && schedule.endTime ? `${schedule.startTime} - ${schedule.endTime}` : '';

    return `${days} ${time}`.trim();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">{t('classes.title')}</h1>
          <p className="text-muted-foreground">{t('classes.description')}</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              {t('classes.addNewClass')}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogTitle>{t('classes.addNewClass')}</DialogTitle>
            <ClassForm
              onSubmit={handleCreateClass}
              isLoading={isLoading}
              organizationId={organizationId}
              teachers={teachers.map(t => ({
                id: t.id,
                firstName: 'Teacher', // This should be fetched from auth users
                lastName: t.id,
                email: 'teacher@example.com', // This should be fetched from auth users
              }))}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t('classes.className')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <select
              value={isActiveFilter === undefined ? 'all' : isActiveFilter.toString()}
              onChange={(e) => setIsActiveFilter(e.target.value === 'all' ? undefined : e.target.value === 'true')}
              className="px-3 py-2 border rounded-md"
            >
              <option value="all">{t('classes.title')}</option>
              <option value="true">Attive</option>
              <option value="false">Inattive</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Classes Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t('classes.title')} ({classes.length})</CardTitle>
          <CardDescription>
            {t('classes.description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('classes.className')}</TableHead>
                <TableHead>{t('classes.teacher')}</TableHead>
                <TableHead>Orario</TableHead>
                <TableHead>Iscritti</TableHead>
                <TableHead>{t('classes.status')}</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {classes.map((classItem) => (
                <TableRow key={classItem.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{classItem.name}</div>
                      {classItem.description && (
                        <div className="text-sm text-muted-foreground">{classItem.description}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {classItem.teacherId ? (
                      <Badge variant="outline">Teacher Assigned</Badge>
                    ) : (
                      <Badge variant="secondary">No Teacher</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {formatSchedule(classItem.schedule)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>0</span> {/* TODO: Fetch enrollment count */}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={classItem.isActive ? 'default' : 'secondary'}>
                      {classItem.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingClass(classItem)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteClass(classItem.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {classes.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <div className="text-muted-foreground">
                      No classes found. Create your first class to get started.
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editingClass} onOpenChange={() => setEditingClass(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogTitle>{t('classes.editClass')}</DialogTitle>
          {editingClass && (
            <ClassForm
              initialData={editingClass}
              onSubmit={handleUpdateClass}
              isLoading={isLoading}
              organizationId={organizationId}
              teachers={teachers.map(t => ({
                id: t.id,
                firstName: 'Teacher', // This should be fetched from auth users
                lastName: t.id,
                email: 'teacher@example.com', // This should be fetched from auth users
              }))}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}