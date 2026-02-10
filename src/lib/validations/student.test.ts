import { describe, expect, it } from 'vitest';
import { createStudentSchema } from './student';

describe('createStudentSchema', () => {
  it('rejects dateOfBirth in the future', () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const result = createStudentSchema.safeParse({
      firstName: 'Mario',
      lastName: 'Rossi',
      dateOfBirth: tomorrow.toISOString().split('T')[0],
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toContain('future');
    }
  });
});

