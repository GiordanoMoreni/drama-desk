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

interface ClassFormProps {
  initialData?: Partial<Class>;
  onSubmit: (data: CreateClassFormData | UpdateClassFormData) => Promise<void>;
  isLoading?: boolean;
  organizationId: string;
  teachers?: Array<{ id: string; firstName: string; lastName: string; email: string }>;
}

const DAYS_OF_WEEK = [
  { value: 'monday', label: 'Monday' },
  { value: 'tuesday', label: 'Tuesday' },
  { value: 'wednesday', label: 'Wednesday' },
  { value: 'thursday', label: 'Thursday' },
  { value: 'friday', label: 'Friday' },
  { value: 'saturday', label: 'Saturday' },
  { value: 'sunday', label: 'Sunday' },
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
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>
              Enter the basic details for this class.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Class Name *</Label>
              <Input
                id="name"
                {...register('name')}
                placeholder="e.g., Beginning Acting"
              />
              {errors.name && (
                <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="Describe what students will learn in this class..."
                rows={3}
              />
              {errors.description && (
                <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="teacherId">Teacher</Label>
              <Select
                value={watch('teacherId') || ''}
                onValueChange={(value) => setValue('teacherId', value === 'none' ? undefined : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a teacher" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No teacher assigned</SelectItem>
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
          <CardHeader>
            <CardTitle>Class Details</CardTitle>
            <CardDescription>
              Configure class capacity and age restrictions.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="maxStudents">Maximum Students</Label>
              <Input
                id="maxStudents"
                type="number"
                {...register('maxStudents', { valueAsNumber: true })}
                placeholder="Leave empty for unlimited"
              />
              {errors.maxStudents && (
                <p className="text-sm text-red-600 mt-1">{errors.maxStudents.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="ageRangeMin">Min Age</Label>
                <Input
                  id="ageRangeMin"
                  type="number"
                  {...register('ageRangeMin', { valueAsNumber: true })}
                  placeholder="Min age"
                />
                {errors.ageRangeMin && (
                  <p className="text-sm text-red-600 mt-1">{errors.ageRangeMin.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="ageRangeMax">Max Age</Label>
                <Input
                  id="ageRangeMax"
                  type="number"
                  {...register('ageRangeMax', { valueAsNumber: true })}
                  placeholder="Max age"
                />
                {errors.ageRangeMax && (
                  <p className="text-sm text-red-600 mt-1">{errors.ageRangeMax.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  {...register('startDate')}
                />
                {errors.startDate && (
                  <p className="text-sm text-red-600 mt-1">{errors.startDate.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  {...register('endDate')}
                />
                {errors.endDate && (
                  <p className="text-sm text-red-600 mt-1">{errors.endDate.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Schedule */}
      <Card>
        <CardHeader>
          <CardTitle>Schedule</CardTitle>
          <CardDescription>
            Set the class schedule (optional).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Days of the Week</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
              {DAYS_OF_WEEK.map((day) => (
                <div key={day.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={day.value}
                    checked={selectedDays.includes(day.value)}
                    onCheckedChange={() => handleDayToggle(day.value)}
                  />
                  <Label htmlFor={day.value} className="text-sm">
                    {day.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {selectedDays.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="startTime">Start Time</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={watch('schedule')?.startTime || ''}
                  onChange={(e) => handleScheduleChange('startTime', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="endTime">End Time</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={watch('schedule')?.endTime || ''}
                  onChange={(e) => handleScheduleChange('endTime', e.target.value)}
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Input
                  id="timezone"
                  placeholder="e.g., America/New_York"
                  value={watch('schedule')?.timezone || ''}
                  onChange={(e) => handleScheduleChange('timezone', e.target.value)}
                />
              </div>
            </div>
          )}

          {errors.schedule && (
            <p className="text-sm text-red-600">{errors.schedule.message}</p>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : isEditing ? 'Update Class' : 'Create Class'}
        </Button>
      </div>
    </form>
  );
}