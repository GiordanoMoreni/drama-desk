'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateStudentFormData, createStudentSchema } from '@/lib/validations/student';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { t } from '@/lib/translations';

interface StudentFormProps {
  onSubmit: (data: CreateStudentFormData) => Promise<void>;
  isLoading?: boolean;
  defaultValues?: Partial<CreateStudentFormData>;
  title?: string;
  description?: string;
  submitLabel?: string;
  resetOnSubmit?: boolean;
}

export function StudentForm({
  onSubmit,
  isLoading = false,
  defaultValues,
  title = t('students.addNewStudent'),
  description = t('students.description'),
  submitLabel = 'Salva studente',
  resetOnSubmit = true,
}: StudentFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateStudentFormData>({
    resolver: zodResolver(createStudentSchema),
    defaultValues: defaultValues || {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      gradeLevel: '',
      emergencyContactName: '',
      emergencyContactPhone: '',
      medicalInfo: '',
      notes: '',
    },
  });

  const handleFormSubmit = async (data: CreateStudentFormData) => {
    // Clean up empty strings to undefined for optional fields
    const cleanedData = Object.fromEntries(
      Object.entries(data).map(([key, value]) => [
        key,
        value === '' ? undefined : value
      ])
    ) as CreateStudentFormData;

    await onSubmit(cleanedData);
    if (resetOnSubmit) {
      reset();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">{t('students.firstName')} *</Label>
              <Input
                id="firstName"
                {...register('firstName')}
                placeholder={t('students.firstName')}
              />
              {errors.firstName && (
                <p className="text-sm text-red-600">{errors.firstName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">{t('students.lastName')} *</Label>
              <Input
                id="lastName"
                {...register('lastName')}
                placeholder={t('students.lastName')}
              />
              {errors.lastName && (
                <p className="text-sm text-red-600">{errors.lastName.message}</p>
              )}
            </div>
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t('auth.email')}</Label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                placeholder={t('auth.email')}
              />
              {errors.email && (
                <p className="text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefono</Label>
              <Input
                id="phone"
                {...register('phone')}
                placeholder="Numero di telefono"
              />
            </div>
          </div>

          {/* Additional Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">{t('students.dateOfBirth')}</Label>
              <Input
                id="dateOfBirth"
                type="date"
                {...register('dateOfBirth')}
              />
              {errors.dateOfBirth && (
                <p className="text-sm text-red-600">{errors.dateOfBirth.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="gradeLevel">Livello</Label>
              <Input
                id="gradeLevel"
                {...register('gradeLevel')}
                placeholder="es. 9° Liceo, Freshman"
              />
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="emergencyContactName">Contatto di Emergenza</Label>
              <Input
                id="emergencyContactName"
                {...register('emergencyContactName')}
                placeholder="Enter emergency contact name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="emergencyContactPhone">Emergency Contact Phone</Label>
              <Input
                id="emergencyContactPhone"
                {...register('emergencyContactPhone')}
                placeholder="Enter emergency contact phone"
              />
            </div>
          </div>

          {/* Medical Info and Notes */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="medicalInfo">Medical Information</Label>
              <Textarea
                id="medicalInfo"
                {...register('medicalInfo')}
                placeholder="Any medical conditions, allergies, or special needs"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                {...register('notes')}
                placeholder="Any additional information about the student"
                rows={3}
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => reset()}
              disabled={isLoading}
            >
              Reset
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Salvataggio...' : submitLabel}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
