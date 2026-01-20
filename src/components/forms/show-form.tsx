'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CreateShowFormData, UpdateShowFormData, createShowSchema, updateShowSchema } from '@/lib/validations/show';
import { Show } from '@/domain/entities';

interface ShowFormProps {
  initialData?: Partial<Show>;
  onSubmit: (data: CreateShowFormData | UpdateShowFormData) => Promise<void>;
  isLoading?: boolean;
  organizationId: string;
  directors?: Array<{ id: string; firstName: string; lastName: string; email: string }>;
}

export function ShowForm({ initialData, onSubmit, isLoading, organizationId, directors = [] }: ShowFormProps) {
  const isEditing = !!initialData?.id;
  const schema = isEditing ? updateShowSchema : createShowSchema;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      directorId: initialData?.directorId || undefined,
      startDate: initialData?.startDate ? initialData.startDate.toISOString().split('T')[0] : '',
      endDate: initialData?.endDate ? initialData.endDate.toISOString().split('T')[0] : '',
      venue: initialData?.venue || '',
      budget: initialData?.budget || undefined,
      ...(isEditing && {
        status: initialData?.status,
        isActive: initialData?.isActive,
      }),
    },
  });

  const onFormSubmit = async (data: CreateShowFormData | UpdateShowFormData) => {
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
              Enter the basic details for this show.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Show Title *</Label>
              <Input
                id="title"
                {...register('title')}
                placeholder="e.g., Romeo and Juliet"
              />
              {errors.title && (
                <p className="text-sm text-red-600 mt-1">{errors.title.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="Describe the show..."
                rows={3}
              />
              {errors.description && (
                <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="directorId">Director</Label>
              <Select
                value={watch('directorId') || ''}
                onValueChange={(value) => setValue('directorId', value === 'none' ? undefined : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a director" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No director assigned</SelectItem>
                  {directors.map((director) => (
                    <SelectItem key={director.id} value={director.id}>
                      {director.firstName} {director.lastName} ({director.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.directorId && (
                <p className="text-sm text-red-600 mt-1">{errors.directorId.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Production Details */}
        <Card>
          <CardHeader>
            <CardTitle>Production Details</CardTitle>
            <CardDescription>
              Set the production schedule and venue.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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

            <div>
              <Label htmlFor="venue">Venue</Label>
              <Input
                id="venue"
                {...register('venue')}
                placeholder="e.g., Main Stage Theater"
              />
              {errors.venue && (
                <p className="text-sm text-red-600 mt-1">{errors.venue.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="budget">Budget</Label>
              <Input
                id="budget"
                type="number"
                step="0.01"
                {...register('budget', { valueAsNumber: true })}
                placeholder="0.00"
              />
              {errors.budget && (
                <p className="text-sm text-red-600 mt-1">{errors.budget.message}</p>
              )}
            </div>

            {isEditing && (
              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={watch('status') || ''}
                  onValueChange={(value) => setValue('status', value as any)}
                >
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
                {(errors as any).status && (
                  <p className="text-sm text-red-600 mt-1">{(errors as any).status.message}</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end space-x-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : isEditing ? 'Update Show' : 'Create Show'}
        </Button>
      </div>
    </form>
  );
}