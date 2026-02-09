'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { createStaffSchema, updateStaffSchema, CreateStaffFormData, UpdateStaffFormData } from '@/lib/validations/staff';
import { StaffMember } from '@/domain/entities';
import { STAFF_ROLE_OPTIONS } from '@/lib/staff-roles';

interface StaffFormProps {
  initialData?: Partial<StaffMember>;
  onSubmit: (data: CreateStaffFormData | UpdateStaffFormData) => Promise<void>;
  isLoading?: boolean;
}

export function StaffForm({ initialData, onSubmit, isLoading }: StaffFormProps) {
  const isEditing = Boolean(initialData?.id);
  const schema = isEditing ? updateStaffSchema : createStaffSchema;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: initialData?.firstName || '',
      lastName: initialData?.lastName || '',
      email: initialData?.email || '',
      phone: initialData?.phone || '',
      primaryRole: initialData?.primaryRole || 'insegnante',
      notes: initialData?.notes || '',
      ...(isEditing && { isActive: initialData?.isActive ?? true }),
    },
  });

  const submitHandler = async (data: CreateStaffFormData | UpdateStaffFormData) => {
    const cleanedData = {
      ...data,
      email: data.email || undefined,
      phone: data.phone || undefined,
      notes: data.notes || undefined,
    };

    await onSubmit(cleanedData);
    if (!isEditing) {
      reset();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? 'Modifica membro staff' : 'Nuovo membro staff'}</CardTitle>
        <CardDescription>
          Definisci le persone che collaborano nella didattica e nelle produzioni teatrali.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(submitHandler)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">Nome *</Label>
              <Input id="firstName" {...register('firstName')} />
              {errors.firstName && <p className="text-sm text-red-600">{errors.firstName.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Cognome *</Label>
              <Input id="lastName" {...register('lastName')} />
              {errors.lastName && <p className="text-sm text-red-600">{errors.lastName.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register('email')} />
              {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefono</Label>
              <Input id="phone" {...register('phone')} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="primaryRole">Ruolo principale *</Label>
            <Select
              value={watch('primaryRole') || 'insegnante'}
              onValueChange={(value) => setValue('primaryRole', value as CreateStaffFormData['primaryRole'])}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleziona ruolo" />
              </SelectTrigger>
              <SelectContent>
                {STAFF_ROLE_OPTIONS.map((role) => (
                  <SelectItem key={role.value} value={role.value}>
                    {role.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.primaryRole && <p className="text-sm text-red-600">{errors.primaryRole.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Note</Label>
            <Textarea id="notes" rows={3} {...register('notes')} />
          </div>

          <div className="flex justify-end gap-3">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Salvataggio...' : isEditing ? 'Aggiorna membro' : 'Crea membro'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
