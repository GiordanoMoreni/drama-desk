'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CreateShowFormData, UpdateShowFormData, createShowSchema, updateShowSchema } from '@/lib/validations/show';
import { Show } from '@/domain/entities';
import { STAFF_ROLE_OPTIONS, getStaffRoleLabel } from '@/lib/staff-roles';
import { t } from '@/lib/translations';

type ShowFormValues = {
  title: string;
  description?: string;
  directorId?: string;
  startDate?: string;
  endDate?: string;
  venue?: string;
  budget?: number;
  status?: 'planning' | 'rehearsing' | 'performing' | 'completed' | 'cancelled';
  isActive?: boolean;
  staffAssignments: Array<{
    staffMemberId: string;
    role: (typeof STAFF_ROLE_OPTIONS)[number]['value'];
    notes?: string;
  }>;
};

interface ShowFormStaffMember {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  primaryRole: (typeof STAFF_ROLE_OPTIONS)[number]['value'];
}

interface ShowFormProps {
  initialData?: Partial<Show & {
    staffAssignments?: Array<{
      staffMemberId: string;
      role: (typeof STAFF_ROLE_OPTIONS)[number]['value'];
      notes?: string;
    }>;
  }>;
  onSubmit: (data: CreateShowFormData | UpdateShowFormData) => Promise<void>;
  isLoading?: boolean;
  directors?: Array<{ id: string; firstName: string; lastName: string; email: string }>;
  staffMembers?: ShowFormStaffMember[];
}

export function ShowForm({
  initialData,
  onSubmit,
  isLoading,
  directors = [],
  staffMembers = [],
}: ShowFormProps) {
  const isEditing = !!initialData?.id;
  const schema = isEditing ? updateShowSchema : createShowSchema;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ShowFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      directorId: initialData?.directorId || undefined,
      startDate: initialData?.startDate ? new Date(initialData.startDate).toISOString().split('T')[0] : '',
      endDate: initialData?.endDate ? new Date(initialData.endDate).toISOString().split('T')[0] : '',
      venue: initialData?.venue || '',
      budget: initialData?.budget || undefined,
      staffAssignments: initialData?.staffAssignments || [],
      ...(isEditing && {
        status: initialData?.status,
        isActive: initialData?.isActive,
      }),
    },
  });

  const selectedAssignments = watch('staffAssignments') || [];

  const onFormSubmit = async (data: CreateShowFormData | UpdateShowFormData) => {
    await onSubmit(data);
  };

  const toggleStaffMember = (member: ShowFormStaffMember, checked: boolean) => {
    const current = [...selectedAssignments];
    const exists = current.some(assignment => assignment.staffMemberId === member.id);

    if (checked && !exists) {
      current.push({
        staffMemberId: member.id,
        role: member.primaryRole,
      });
    }

    if (!checked) {
      const filtered = current.filter(assignment => assignment.staffMemberId !== member.id);
      setValue('staffAssignments', filtered);
      return;
    }

    setValue('staffAssignments', current);
  };

  const updateStaffAssignmentRole = (staffMemberId: string, role: (typeof STAFF_ROLE_OPTIONS)[number]['value']) => {
    const current = selectedAssignments.map(assignment =>
      assignment.staffMemberId === staffMemberId ? { ...assignment, role } : assignment
    );
    setValue('staffAssignments', current);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6 overflow-x-hidden">
      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t('shows.title')}</CardTitle>
            <CardDescription>{t('shows.description')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 min-w-0">
            <div>
              <Label htmlFor="title">{t('shows.showTitle')} *</Label>
              <Input id="title" {...register('title')} placeholder={t('shows.showTitle')} />
              {errors.title && <p className="text-sm text-red-600 mt-1">{errors.title.message}</p>}
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" {...register('description')} placeholder="Describe the show..." rows={3} />
              {errors.description && <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>}
            </div>

            <div>
              <Label htmlFor="directorId">{t('shows.director')}</Label>
              <Select
                value={watch('directorId') || ''}
                onValueChange={(value) => setValue('directorId', value === 'none' ? undefined : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('shows.director')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nessun regista assegnato</SelectItem>
                  {directors.map((director) => (
                    <SelectItem key={director.id} value={director.id}>
                      {director.firstName} {director.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.directorId && <p className="text-sm text-red-600 mt-1">{errors.directorId.message}</p>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Dettagli Produzione</CardTitle>
            <CardDescription>Imposta il calendario della produzione e la sede.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 min-w-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <Input id="startDate" type="date" {...register('startDate')} />
                {errors.startDate && <p className="text-sm text-red-600 mt-1">{errors.startDate.message}</p>}
              </div>
              <div>
                <Label htmlFor="endDate">End Date</Label>
                <Input id="endDate" type="date" {...register('endDate')} />
                {errors.endDate && <p className="text-sm text-red-600 mt-1">{errors.endDate.message}</p>}
              </div>
            </div>

            <div>
              <Label htmlFor="venue">Venue</Label>
              <Input id="venue" {...register('venue')} placeholder="e.g., Main Stage Theater" />
              {errors.venue && <p className="text-sm text-red-600 mt-1">{errors.venue.message}</p>}
            </div>

            <div>
              <Label htmlFor="budget">Budget</Label>
              <Input id="budget" type="number" step="0.01" {...register('budget', { valueAsNumber: true })} placeholder="0.00" />
              {errors.budget && <p className="text-sm text-red-600 mt-1">{errors.budget.message}</p>}
            </div>

            {isEditing && (
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={watch('status') || ''} onValueChange={(value) => setValue('status', value as ShowFormValues['status'])}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planning">Planning</SelectItem>
                    <SelectItem value="rehearsing">Rehearsing</SelectItem>
                    <SelectItem value="performing">Performing</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                {errors.status && <p className="text-sm text-red-600 mt-1">{errors.status.message}</p>}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Staff coinvolto</CardTitle>
          <CardDescription>Seleziona le persone dello staff coinvolte nello spettacolo e assegna il ruolo.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="hidden md:grid md:grid-cols-[2rem_minmax(0,1fr)_11rem] gap-3 px-1 text-xs font-medium text-muted-foreground">
            <div />
            <div>Membro staff</div>
            <div>Ruolo nello spettacolo</div>
          </div>
          <div className="max-h-[26rem] overflow-y-auto pr-1 space-y-2">
            {staffMembers.map((member) => {
              const assignment = selectedAssignments.find(item => item.staffMemberId === member.id);
              const isSelected = Boolean(assignment);

              return (
                <div key={member.id} className="border rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-[2rem_minmax(0,1fr)_11rem] gap-3 items-start md:items-center">
                    <div className="flex md:justify-center">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={(checked) => toggleStaffMember(member, checked === true)}
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm sm:text-base font-semibold text-foreground leading-tight break-words">
                        {member.firstName} {member.lastName}
                      </p>
                      <p className="mt-1 text-sm text-foreground/90 break-all">
                        <span className="font-medium">Email:</span> {member.email || 'N/A'}
                      </p>
                      <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
                        <span className="font-medium">Ruolo base:</span> {getStaffRoleLabel(member.primaryRole)}
                      </p>
                    </div>
                    <div className="w-full min-w-0">
                      <Select
                        value={assignment?.role || member.primaryRole}
                        disabled={!isSelected}
                        onValueChange={(role) => updateStaffAssignmentRole(member.id, role as ShowFormValues['staffAssignments'][number]['role'])}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Ruolo nello spettacolo" />
                        </SelectTrigger>
                        <SelectContent>
                          {STAFF_ROLE_OPTIONS.map((roleOption) => (
                            <SelectItem key={roleOption.value} value={roleOption.value}>
                              {roleOption.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          {staffMembers.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Nessun membro staff disponibile. Aggiungi prima lo staff nella sezione dedicata.
            </p>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : isEditing ? 'Update Show' : 'Create Show'}
        </Button>
      </div>
    </form>
  );
}
