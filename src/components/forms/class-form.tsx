'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CreateClassFormData, UpdateClassFormData, createClassSchema, updateClassSchema } from '@/lib/validations/class';
import { Class } from '@/domain/entities';
import { t } from '@/lib/translations';

interface ClassFormProps {
  initialData?: Partial<Class>;
  onSubmit: (data: CreateClassFormData | UpdateClassFormData) => Promise<void>;
  isLoading?: boolean;
  organizationId: string;
  teachers?: Array<{ id: string; firstName: string; lastName: string; email: string }>;
}

const DAYS_OF_WEEK = [
  { value: 'monday', label: 'Lunedì' },
  { value: 'tuesday', label: 'Martedì' },
  { value: 'wednesday', label: 'Mercoledì' },
  { value: 'thursday', label: 'Giovedì' },
  { value: 'friday', label: 'Venerdì' },
  { value: 'saturday', label: 'Sabato' },
  { value: 'sunday', label: 'Domenica' },
] as const;

export function ClassForm({ initialData, onSubmit, isLoading, organizationId, teachers = [] }: ClassFormProps) {
  const [selectedDays, setSelectedDays] = useState<string[]>(
    initialData?.schedule?.days || []
  );

  const isEditing = !!initialData?.id;
  const schema = isEditing ? updateClassSchema : createClassSchema;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      teacherId: initialData?.teacherId || undefined,
      maxStudents: initialData?.maxStudents || undefined,
      ageRangeMin: initialData?.ageRangeMin || undefined,
      ageRangeMax: initialData?.ageRangeMax || undefined,
      schedule: initialData?.schedule as any || undefined,
      startDate: initialData?.startDate ? initialData.startDate.toISOString().split('T')[0] : '',
      endDate: initialData?.endDate ? initialData.endDate.toISOString().split('T')[0] : '',
    },
  });

  const handleDayToggle = (day: string) => {
    const newSelectedDays = selectedDays.includes(day)
      ? selectedDays.filter(d => d !== day)
      : [...selectedDays, day];

    setSelectedDays(newSelectedDays);

    // Update form value
    setValue('schedule', {
      days: newSelectedDays as any,
      startTime: watch('schedule')?.startTime || '',
      endTime: watch('schedule')?.endTime || '',
      timezone: watch('schedule')?.timezone,
    });
  };

  const handleScheduleChange = (field: 'startTime' | 'endTime' | 'timezone', value: string) => {
    const currentSchedule = watch('schedule') || { days: selectedDays };
    setValue('schedule', {
      ...currentSchedule,
      [field]: value,
    } as any);
  };

  const onFormSubmit = async (data: CreateClassFormData | UpdateClassFormData) => {
    await onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-8 w-full">
      {/* Basic Information */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl">{t('common.edit')}</CardTitle>
          <CardDescription className="text-base mt-2">
            {t('classes.description')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">{t('classes.className')} *</Label>
            <Input
              id="name"
              {...register('name')}
              placeholder={t('classes.className')}
              className="h-10"
            />
            {errors.name && (
              <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">{t('classes.description')}</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder={t('classes.description')}
              rows={3}
              className="resize-none"
            />
            {errors.description && (
              <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="teacherId" className="text-sm font-medium">{t('classes.teacher')}</Label>
            <Select
              value={watch('teacherId') || ''}
              onValueChange={(value) => setValue('teacherId', value === 'none' ? undefined : value)}
            >
              <SelectTrigger className="h-10">
                <SelectValue placeholder={t('classes.teacher')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nessun insegnante assegnato</SelectItem>
                {teachers.map((teacher) => (
                  <SelectItem key={teacher.id} value={teacher.id}>
                    {teacher.firstName} {teacher.lastName} ({teacher.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.teacherId && (
              <p className="text-sm text-red-600 mt-1">{errors.teacherId.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Class Details */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl">Class Details</CardTitle>
          <CardDescription className="text-base mt-2">
            Configure class capacity and age restrictions.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="maxStudents" className="text-sm font-medium">Maximum Students</Label>
            <Input
              id="maxStudents"
              type="number"
              {...register('maxStudents', { valueAsNumber: true })}
              placeholder="Leave empty for unlimited"
              className="h-10"
            />
            {errors.maxStudents && (
              <p className="text-sm text-red-600 mt-1">{errors.maxStudents.message}</p>
            )}
          </div>

          <div>
            <Label className="text-sm font-medium mb-3 block">Age Range</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ageRangeMin" className="text-xs text-gray-600">Min Age</Label>
                <Input
                  id="ageRangeMin"
                  type="number"
                  {...register('ageRangeMin', { valueAsNumber: true })}
                  placeholder="Min age"
                  className="h-10"
                />
                {errors.ageRangeMin && (
                  <p className="text-sm text-red-600 mt-1">{errors.ageRangeMin.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="ageRangeMax" className="text-xs text-gray-600">Max Age</Label>
                <Input
                  id="ageRangeMax"
                  type="number"
                  {...register('ageRangeMax', { valueAsNumber: true })}
                  placeholder="Max age"
                  className="h-10"
                />
                {errors.ageRangeMax && (
                  <p className="text-sm text-red-600 mt-1">{errors.ageRangeMax.message}</p>
                )}
              </div>
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium mb-3 block">Class Duration</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate" className="text-xs text-gray-600">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  {...register('startDate')}
                  className="h-10"
                />
                {errors.startDate && (
                  <p className="text-sm text-red-600 mt-1">{errors.startDate.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate" className="text-xs text-gray-600">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  {...register('endDate')}
                  className="h-10"
                />
                {errors.endDate && (
                  <p className="text-sm text-red-600 mt-1">{errors.endDate.message}</p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Schedule */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl">Schedule</CardTitle>
          <CardDescription className="text-base mt-2">
            Set the class schedule (optional).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <Label className="text-sm font-medium block">Days of the Week</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {DAYS_OF_WEEK.map((day) => (
                <div key={day.value} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                  <Checkbox
                    id={day.value}
                    checked={selectedDays.includes(day.value)}
                    onCheckedChange={() => handleDayToggle(day.value)}
                    className="w-5 h-5"
                  />
                  <Label htmlFor={day.value} className="text-sm font-medium cursor-pointer flex-1">
                    {day.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {selectedDays.length > 0 && (
            <div className="space-y-4 pt-6 border-t">
              <Label className="text-sm font-medium block">Class Times</Label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startTime" className="text-xs text-gray-600">Start Time</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={watch('schedule')?.startTime || ''}
                    onChange={(e) => handleScheduleChange('startTime', e.target.value)}
                    className="h-10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endTime" className="text-xs text-gray-600">End Time</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={watch('schedule')?.endTime || ''}
                    onChange={(e) => handleScheduleChange('endTime', e.target.value)}
                    className="h-10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone" className="text-xs text-gray-600">Timezone</Label>
                  <Input
                    id="timezone"
                    placeholder="e.g., Europe/Rome"
                    value={watch('schedule')?.timezone || ''}
                    onChange={(e) => handleScheduleChange('timezone', e.target.value)}
                    className="h-10"
                  />
                </div>
              </div>
            </div>
          )}

          {errors.schedule && (
            <p className="text-sm text-red-600 mt-4">{errors.schedule.message}</p>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3 pt-4 border-t sticky bottom-0 bg-white">
        <Button
          type="submit"
          disabled={isLoading}
          className="min-w-[160px] h-10 text-base"
        >
          {isLoading ? 'Saving...' : isEditing ? 'Update Class' : 'Create Class'}
        </Button>
      </div>
    </form>
  );
}