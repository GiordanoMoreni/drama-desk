'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CreateOrganizationFormData, UpdateOrganizationFormData, createOrganizationSchema, updateOrganizationSchema } from '@/lib/validations/organization';
import { Organization } from '@/domain/entities';

interface OrganizationFormProps {
  initialData?: Partial<Organization>;
  onSubmit: (data: CreateOrganizationFormData | UpdateOrganizationFormData) => Promise<void>;
  isLoading?: boolean;
}

export function OrganizationForm({ initialData, onSubmit, isLoading }: OrganizationFormProps) {
  const isEditing = !!initialData?.id;
  const schema = isEditing ? updateOrganizationSchema : createOrganizationSchema;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: initialData?.name || '',
      slug: initialData?.slug || '',
      description: initialData?.description || '',
      logoUrl: initialData?.logoUrl || undefined,
      websiteUrl: initialData?.websiteUrl || undefined,
      contactEmail: initialData?.contactEmail || undefined,
      contactPhone: initialData?.contactPhone || undefined,
      address: initialData?.address || undefined,
      city: initialData?.city || undefined,
      state: initialData?.state || undefined,
      postalCode: initialData?.postalCode || undefined,
      country: initialData?.country || undefined,
      isActive: initialData?.isActive ?? true,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>
              Enter the basic details for this organization.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Organization Name *</Label>
              <Input
                id="name"
                {...register('name')}
                placeholder="e.g., Springfield Community Theater"
              />
              {errors.name && (
                <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="slug">Slug *</Label>
              <Input
                id="slug"
                {...register('slug')}
                placeholder="e.g., springfield-theater"
                disabled={isEditing} // Don't allow slug changes after creation
              />
              <p className="text-xs text-gray-500 mt-1">
                Used in URLs. Only lowercase letters, numbers, and hyphens allowed.
              </p>
              {(errors as any).slug && (
                <p className="text-sm text-red-600 mt-1">{(errors as any).slug.message}</p>
              )}
              {errors.description && (
                <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>
              )}
              {errors.contactEmail && (
                <p className="text-sm text-red-600 mt-1">{errors.contactEmail.message}</p>
              )}
              {(errors as any).contactPhone && (
                <p className="text-sm text-red-600 mt-1">{(errors as any).contactPhone.message}</p>
              )}
              {errors.websiteUrl && (
                <p className="text-sm text-red-600 mt-1">{errors.websiteUrl.message}</p>
              )}
              {(errors as any).logoUrl && (
                <p className="text-sm text-red-600 mt-1">{(errors as any).logoUrl.message}</p>
              )}
              {(errors as any).address && (
                <p className="text-sm text-red-600 mt-1">{(errors as any).address.message}</p>
              )}
              {(errors as any).city && (
                <p className="text-sm text-red-600 mt-1">{(errors as any).city.message}</p>
              )}
              {(errors as any).state && (
                <p className="text-sm text-red-600 mt-1">{(errors as any).state.message}</p>
              )}
              {(errors as any).postalCode && (
                <p className="text-sm text-red-600 mt-1">{(errors as any).postalCode.message}</p>
              )}
              {(errors as any).country && (
                <p className="text-sm text-red-600 mt-1">{(errors as any).country.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="Describe your theater organization..."
                rows={3}
              />
              {errors.description && (
                <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
            <CardDescription>
              How can people reach your organization?
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="contactEmail">Contact Email</Label>
              <Input
                id="contactEmail"
                type="email"
                {...register('contactEmail')}
                placeholder="contact@yourtheater.org"
              />
              {errors.contactEmail && (
                <p className="text-sm text-red-600 mt-1">{errors.contactEmail.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="contactPhone">Contact Phone</Label>
              <Input
                id="contactPhone"
                {...register('contactPhone')}
                placeholder="+1 (555) 123-4567"
              />
              {(errors as any).contactPhone && (
                <p className="text-sm text-red-600 mt-1">{(errors as any).contactPhone.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="websiteUrl">Website URL</Label>
              <Input
                id="websiteUrl"
                type="url"
                {...register('websiteUrl')}
                placeholder="https://www.yourtheater.org"
              />
              {errors.websiteUrl && (
                <p className="text-sm text-red-600 mt-1">{errors.websiteUrl.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="logoUrl">Logo URL</Label>
              <Input
                id="logoUrl"
                type="url"
                {...register('logoUrl')}
                placeholder="https://..."
              />
              {(errors as any).logoUrl && (
                <p className="text-sm text-red-600 mt-1">{(errors as any).logoUrl.message}</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Address */}
      <Card>
        <CardHeader>
          <CardTitle>Address</CardTitle>
          <CardDescription>
            Physical location of your organization (optional).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="address">Street Address</Label>
              <Input
                id="address"
                {...register('address')}
                placeholder="123 Main Street"
              />
              {(errors as any).address && (
                <p className="text-sm text-red-600 mt-1">{(errors as any).address.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                {...register('city')}
                placeholder="Springfield"
              />
              {(errors as any).city && (
                <p className="text-sm text-red-600 mt-1">{(errors as any).city.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="state">State/Province</Label>
              <Input
                id="state"
                {...register('state')}
                placeholder="IL"
              />
              {(errors as any).state && (
                <p className="text-sm text-red-600 mt-1">{(errors as any).state.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="postalCode">Postal Code</Label>
              <Input
                id="postalCode"
                {...register('postalCode')}
                placeholder="62701"
              />
              {(errors as any).postalCode && (
                <p className="text-sm text-red-600 mt-1">{(errors as any).postalCode.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                {...register('country')}
                placeholder="United States"
              />
              {(errors as any).country && (
                <p className="text-sm text-red-600 mt-1">{(errors as any).country.message}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : isEditing ? 'Update Organization' : 'Create Organization'}
        </Button>
      </div>
    </form>
  );
}