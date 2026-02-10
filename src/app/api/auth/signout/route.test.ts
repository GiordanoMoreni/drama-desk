import { describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/auth', () => ({
  signOut: vi.fn(),
}));

import { signOut } from '@/lib/auth';
import { POST } from './route';

describe('POST /api/auth/signout', () => {
  it('returns success when signOut completes', async () => {
    vi.mocked(signOut).mockResolvedValueOnce();

    const response = await POST();
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload).toEqual({ success: true });
    expect(signOut).toHaveBeenCalledTimes(1);
  });

  it('returns 500 when signOut throws', async () => {
    vi.mocked(signOut).mockRejectedValueOnce(new Error('boom'));

    const response = await POST();
    const payload = await response.json();

    expect(response.status).toBe(500);
    expect(payload).toEqual({ error: 'Failed to sign out' });
  });
});

