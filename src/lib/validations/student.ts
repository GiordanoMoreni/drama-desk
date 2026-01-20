import { z } from 'zod';

export const createStudentSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(100, 'First name too long'),
  lastName: z.string().min(1, 'Last name is required').max(100, 'Last name too long'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().optional(),
  dateOfBirth: z.string().optional().refine((val) => {
    if (!val) return true;
    const date = new Date(val);
    return date <= new Date();
  }, 'Date of birth cannot be in the future'),
  gradeLevel: z.string().optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  medicalInfo: z.string().optional(),
  notes: z.string().optional(),
});

export const updateStudentSchema = createStudentSchema.partial();

export type CreateStudentFormData = z.infer<typeof createStudentSchema>;
export type UpdateStudentFormData = z.infer<typeof updateStudentSchema>;