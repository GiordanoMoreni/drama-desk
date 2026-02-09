import { z } from 'zod';

export const staffRoleValues = [
  'insegnante',
  'regista',
  'tecnico',
  'assistente',
  'drammaturgo',
  'coreografo',
  'scenografo',
  'costumista',
  'vocal_coach',
  'movimento_scenico',
] as const;

export const createStaffSchema = z.object({
  firstName: z.string().min(1, 'Il nome è obbligatorio').max(100),
  lastName: z.string().min(1, 'Il cognome è obbligatorio').max(100),
  email: z.string().email('Email non valida').optional().nullable().transform(val => val || undefined),
  phone: z.string().max(50).optional().nullable().transform(val => val || undefined),
  primaryRole: z.enum(staffRoleValues),
  notes: z.string().max(2000).optional().nullable().transform(val => val || undefined),
});

export const updateStaffSchema = createStaffSchema.partial().extend({
  isActive: z.boolean().optional(),
});

export const showStaffAssignmentSchema = z.object({
  staffMemberId: z.string().uuid('Staff member non valido'),
  role: z.enum(staffRoleValues),
  notes: z.string().max(1000).optional().nullable().transform(val => val || undefined),
});

export type CreateStaffFormData = z.infer<typeof createStaffSchema>;
export type UpdateStaffFormData = z.infer<typeof updateStaffSchema>;
export type ShowStaffAssignmentFormData = z.infer<typeof showStaffAssignmentSchema>;
