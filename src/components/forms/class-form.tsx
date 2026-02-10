'use client';

import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
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
  teachers?: Array<{ id: string; firstName: string; lastName: string; email: string }>;
}

const DAYS_OF_WEEK = [
  { value: 'monday', label: 'Lunedi' },
  { value: 'tuesday', label: 'Martedi' },
  { value: 'wednesday', label: 'Mercoledi' },
  { value: 'thursday', label: 'Giovedi' },
  { value: 'friday', label: 'Venerdi' },
  { value: 'saturday', label: 'Sabato' },
  { value: 'sunday', label: 'Domenica' },
] as const;

type DayValue = (typeof DAYS_OF_WEEK)[number]['value'];
const VALID_DAY_VALUES: DayValue[] = DAYS_OF_WEEK.map((day) => day.value);

export function ClassForm({ initialData, onSubmit, isLoading, teachers = [] }: ClassFormProps) {
  const toInputDate = (value?: Date | string) => {
    if (!value) return '';
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return date.toISOString().split('T')[0];
  };

  const normalizeSchedule = (schedule?: Class['schedule']) => {
    if (!schedule) return undefined;
    return {
      ...schedule,
      days: (schedule.days || []).filter((day): day is DayValue => VALID_DAY_VALUES.includes(day as DayValue)),
    };
  };

  const [selectedDays, setSelectedDays] = useState<string[]>(initialData?.schedule?.days || []);

  const isEditing = !!initialData?.id;
  const schema = isEditing ? updateClassSchema : createClassSchema;

  const {
    register,
    handleSubmit,
    setValue,
    control,
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
      schedule: normalizeSchedule(initialData?.schedule),
      startDate: toInputDate(initialData?.startDate),
      endDate: toInputDate(initialData?.endDate),
    },
  });

  const watchedSchedule = useWatch({ control, name: 'schedule' });
  const watchedTeacherId = useWatch({ control, name: 'teacherId' });

  const handleDayToggle = (day: DayValue) => {
    const newSelectedDays = selectedDays.includes(day)
      ? selectedDays.filter(d => d !== day)
      : [...selectedDays, day];

    setSelectedDays(newSelectedDays);
    setValue('schedule', {
      days: newSelectedDays as DayValue[],
      startTime: watchedSchedule?.startTime || '',
      endTime: watchedSchedule?.endTime || '',
      timezone: watchedSchedule?.timezone,
    });
  };

  const handleScheduleChange = (field: 'startTime' | 'endTime' | 'timezone', value: string) => {
    const currentSchedule = watchedSchedule || {
      days: selectedDays as DayValue[],
      startTime: '',
      endTime: '',
      timezone: '',
    };
    setValue('schedule', {
      ...currentSchedule,
      [field]: value,
    });
  };

  const onFormSubmit = async (data: CreateClassFormData | UpdateClassFormData) => {
    await onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-8 w-full">
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl">
            {isEditing ? t('classes.editClass') : t('classes.addNewClass')}
          </CardTitle>
          <CardDescription className="text-base mt-2">{t('classes.description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">{t('classes.className')} *</Label>
            <Input id="name" {...register('name')} placeholder={t('classes.className')} className="h-10" />
            {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">{t('classes.description')}</Label>
            <Textarea id="description" {...register('description')} placeholder={t('classes.description')} rows={3} className="resize-none" />
            {errors.description && <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="teacherId" className="text-sm font-medium">{t('classes.teacher')}</Label>
            <Select value={watchedTeacherId || ''} onValueChange={(value) => setValue('teacherId', value === 'none' ? undefined : value)}>
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
            {errors.teacherId && <p className="text-sm text-red-600 mt-1">{errors.teacherId.message}</p>}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl">Dettagli classe</CardTitle>
          <CardDescription className="text-base mt-2">Imposta capienza, fascia di eta e durata della classe.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="maxStudents" className="text-sm font-medium">Numero massimo studenti</Label>
            <Input id="maxStudents" type="number" {...register('maxStudents', { valueAsNumber: true })} placeholder="Lascia vuoto per nessun limite" className="h-10" />
            {errors.maxStudents && <p className="text-sm text-red-600 mt-1">{errors.maxStudents.message}</p>}
          </div>

          <div>
            <Label className="text-sm font-medium mb-3 block">Fascia di eta</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ageRangeMin" className="text-xs text-gray-600">Eta minima</Label>
                <Input id="ageRangeMin" type="number" {...register('ageRangeMin', { valueAsNumber: true })} placeholder="Eta minima" className="h-10" />
                {errors.ageRangeMin && <p className="text-sm text-red-600 mt-1">{errors.ageRangeMin.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="ageRangeMax" className="text-xs text-gray-600">Eta massima</Label>
                <Input id="ageRangeMax" type="number" {...register('ageRangeMax', { valueAsNumber: true })} placeholder="Eta massima" className="h-10" />
                {errors.ageRangeMax && <p className="text-sm text-red-600 mt-1">{errors.ageRangeMax.message}</p>}
              </div>
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium mb-3 block">Durata classe</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate" className="text-xs text-gray-600">Data inizio</Label>
                <Input id="startDate" type="date" {...register('startDate')} className="h-10" />
                {errors.startDate && <p className="text-sm text-red-600 mt-1">{errors.startDate.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate" className="text-xs text-gray-600">Data fine</Label>
                <Input id="endDate" type="date" {...register('endDate')} className="h-10" />
                {errors.endDate && <p className="text-sm text-red-600 mt-1">{errors.endDate.message}</p>}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl">Programmazione</CardTitle>
          <CardDescription className="text-base mt-2">Imposta la ricorrenza settimanale della classe (opzionale).</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <Label className="text-sm font-medium block">I giorni della settimana</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {DAYS_OF_WEEK.map((day) => (
                <div key={day.value} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                  <Checkbox id={day.value} checked={selectedDays.includes(day.value)} onCheckedChange={() => handleDayToggle(day.value)} className="w-5 h-5" />
                  <Label htmlFor={day.value} className="text-sm font-medium cursor-pointer flex-1">{day.label}</Label>
                </div>
              ))}
            </div>
          </div>

          {selectedDays.length > 0 && (
            <div className="space-y-4 pt-6 border-t">
              <Label className="text-sm font-medium block">Orari lezione</Label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startTime" className="text-xs text-gray-600">Ora inizio</Label>
                  <Input id="startTime" type="time" value={watchedSchedule?.startTime || ''} onChange={(e) => handleScheduleChange('startTime', e.target.value)} className="h-10" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endTime" className="text-xs text-gray-600">Ora fine</Label>
                  <Input id="endTime" type="time" value={watchedSchedule?.endTime || ''} onChange={(e) => handleScheduleChange('endTime', e.target.value)} className="h-10" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone" className="text-xs text-gray-600">Fuso orario</Label>
                  <Input id="timezone" placeholder="es. Europe/Rome" value={watchedSchedule?.timezone || ''} onChange={(e) => handleScheduleChange('timezone', e.target.value)} className="h-10" />
                </div>
              </div>
            </div>
          )}

          {errors.schedule && <p className="text-sm text-red-600 mt-4">{errors.schedule.message}</p>}
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3 pt-4 border-t sticky bottom-0 bg-white">
        <Button type="submit" disabled={isLoading} className="min-w-[160px] h-10 text-base">
          {isLoading ? 'Salvataggio...' : isEditing ? 'Aggiorna classe' : 'Crea classe'}
        </Button>
      </div>
    </form>
  );
}
