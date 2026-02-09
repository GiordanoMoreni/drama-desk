import { z } from 'zod';
import { staffRoleValues } from './staff';

export const createShowSchema = z.object({
  title: z.string().min(1, 'Show title is required').max(255, 'Show title too long'),
  description: z.string().optional(),
  directorId: z.string().uuid().optional().nullable().transform(val => val === null ? undefined : val),
  startDate: z.string().optional().nullable().refine((val) => {
    if (!val) return true;
    const date = new Date(val);
    return date >= new Date(new Date().setHours(0, 0, 0, 0)); // Allow today
  }, 'Start date cannot be in the past').transform(val => val === null ? undefined : val),
  endDate: z.string().optional().nullable().transform(val => val === null ? undefined : val),
  venue: z.string().optional(),
  budget: z.number().positive().optional().nullable().transform(val => val === null ? undefined : val),
  staffAssignments: z.array(z.object({
    staffMemberId: z.string().uuid('Staff member non valido'),
    role: z.enum(staffRoleValues),
    notes: z.string().max(1000).optional(),
  })).optional(),
}).refine((data) => {
  if (data.startDate && data.endDate) {
    return new Date(data.startDate) <= new Date(data.endDate);
  }
  return true;
}, {
  message: 'Start date cannot be after end date',
  path: ['startDate'],
});

export const updateShowSchema = z.object({
  title: z.string().min(1, 'Show title is required').max(255, 'Show title too long').optional(),
  description: z.string().optional(),
  directorId: z.string().uuid().optional().nullable(),
  startDate: z.string().optional().nullable().refine((val) => {
    if (!val) return true;
    const date = new Date(val);
    return date >= new Date(new Date().setHours(0, 0, 0, 0)); // Allow today
  }, 'Start date cannot be in the past'),
  endDate: z.string().optional().nullable(),
  venue: z.string().optional(),
  budget: z.number().positive().optional().nullable(),
  status: z.enum(['planning', 'rehearsing', 'performing', 'completed', 'cancelled']).optional(),
  isActive: z.boolean().optional(),
  staffAssignments: z.array(z.object({
    staffMemberId: z.string().uuid('Staff member non valido'),
    role: z.enum(staffRoleValues),
    notes: z.string().max(1000).optional(),
  })).optional(),
}).transform((data) => ({
  ...data,
  directorId: data.directorId === null ? undefined : data.directorId,
  startDate: data.startDate === null ? undefined : data.startDate,
  endDate: data.endDate === null ? undefined : data.endDate,
  budget: data.budget === null ? undefined : data.budget,
}));

export type CreateShowFormData = z.infer<typeof createShowSchema>;
export type UpdateShowFormData = z.infer<typeof updateShowSchema>;
