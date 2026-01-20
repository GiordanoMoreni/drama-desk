import { z } from 'zod';

export const createClassSchema = z.object({
  name: z.string().min(1, 'Class name is required').max(255, 'Class name too long'),
  description: z.string().optional(),
  teacherId: z.string().uuid().optional().nullable(),
  maxStudents: z.number().int().positive().optional().nullable(),
  ageRangeMin: z.number().int().min(0).max(100).optional().nullable(),
  ageRangeMax: z.number().int().min(0).max(100).optional().nullable(),
  schedule: z.object({
    days: z.array(z.enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'])),
    startTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
    endTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
    timezone: z.string().optional(),
  }).optional().nullable(),
  startDate: z.string().optional().nullable().refine((val) => {
    if (!val) return true;
    const date = new Date(val);
    return date >= new Date();
  }, 'Start date cannot be in the past'),
  endDate: z.string().optional().nullable(),
}).refine((data) => {
  if (data.ageRangeMin !== null && data.ageRangeMin !== undefined &&
      data.ageRangeMax !== null && data.ageRangeMax !== undefined) {
    return data.ageRangeMin <= data.ageRangeMax;
  }
  return true;
}, {
  message: 'Minimum age cannot be greater than maximum age',
  path: ['ageRangeMin'],
}).refine((data) => {
  if (data.startDate && data.endDate) {
    return new Date(data.startDate) <= new Date(data.endDate);
  }
  return true;
}, {
  message: 'Start date cannot be after end date',
  path: ['startDate'],
}).refine((data) => {
  if (data.schedule?.startTime && data.schedule?.endTime) {
    return data.schedule.startTime < data.schedule.endTime;
  }
  return true;
}, {
  message: 'Start time must be before end time',
  path: ['schedule', 'startTime'],
}).transform((data) => ({
  ...data,
  teacherId: data.teacherId === null ? undefined : data.teacherId,
  maxStudents: data.maxStudents === null ? undefined : data.maxStudents,
  ageRangeMin: data.ageRangeMin === null ? undefined : data.ageRangeMin,
  ageRangeMax: data.ageRangeMax === null ? undefined : data.ageRangeMax,
  schedule: data.schedule === null ? undefined : data.schedule,
  startDate: data.startDate === null ? undefined : data.startDate,
  endDate: data.endDate === null ? undefined : data.endDate,
}));

export const updateClassSchema = z.object({
  name: z.string().min(1, 'Class name is required').max(255, 'Class name too long').optional(),
  description: z.string().optional(),
  teacherId: z.string().uuid().optional().nullable(),
  maxStudents: z.number().int().positive().optional().nullable(),
  ageRangeMin: z.number().int().min(0).max(100).optional().nullable(),
  ageRangeMax: z.number().int().min(0).max(100).optional().nullable(),
  schedule: z.object({
    days: z.array(z.enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'])),
    startTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
    endTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
    timezone: z.string().optional(),
  }).optional().nullable(),
  startDate: z.string().optional().nullable().refine((val) => {
    if (!val) return true;
    const date = new Date(val);
    return date >= new Date();
  }, 'Start date cannot be in the past'),
  endDate: z.string().optional().nullable(),
}).transform((data) => ({
  ...data,
  teacherId: data.teacherId === null ? undefined : data.teacherId,
  maxStudents: data.maxStudents === null ? undefined : data.maxStudents,
  ageRangeMin: data.ageRangeMin === null ? undefined : data.ageRangeMin,
  ageRangeMax: data.ageRangeMax === null ? undefined : data.ageRangeMax,
  schedule: data.schedule === null ? undefined : data.schedule,
  startDate: data.startDate === null ? undefined : data.startDate,
  endDate: data.endDate === null ? undefined : data.endDate,
}));

export type CreateClassFormData = z.infer<typeof createClassSchema>;
export type UpdateClassFormData = z.infer<typeof updateClassSchema>;