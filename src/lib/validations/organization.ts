import { z } from 'zod';

export const createOrganizationSchema = z.object({
  name: z.string().min(1, 'Organization name is required').max(255, 'Organization name too long'),
  slug: z.string()
    .min(1, 'Organization slug is required')
    .max(100, 'Organization slug too long')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  description: z.string().optional(),
  contactEmail: z.string().email('Invalid email address').optional().or(z.literal('')),
  websiteUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
});

export const updateOrganizationSchema = z.object({
  name: z.string().min(1, 'Organization name is required').max(255, 'Organization name too long').optional(),
  description: z.string().optional(),
  logoUrl: z.string().url('Invalid URL').optional().nullable().transform(val => val === null ? undefined : val),
  websiteUrl: z.string().url('Invalid URL').optional().nullable().transform(val => val === null ? undefined : val),
  contactEmail: z.string().email('Invalid email address').optional().nullable().transform(val => val === null ? undefined : val),
  contactPhone: z.string().optional().nullable().transform(val => val === null ? undefined : val),
  address: z.string().optional().nullable().transform(val => val === null ? undefined : val),
  city: z.string().optional().nullable().transform(val => val === null ? undefined : val),
  state: z.string().optional().nullable().transform(val => val === null ? undefined : val),
  postalCode: z.string().optional().nullable().transform(val => val === null ? undefined : val),
  country: z.string().optional().nullable().transform(val => val === null ? undefined : val),
  isActive: z.boolean().optional(),
});

export type CreateOrganizationFormData = z.infer<typeof createOrganizationSchema>;
export type UpdateOrganizationFormData = z.infer<typeof updateOrganizationSchema>;