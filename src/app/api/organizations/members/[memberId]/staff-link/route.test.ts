import { describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/auth', () => ({
  requireOrganization: vi.fn(),
}));

vi.mock('@/lib/di', () => ({
  getServices: vi.fn(),
}));

import { requireOrganization } from '@/lib/auth';
import { getServices } from '@/lib/di';
import { DELETE, PUT } from './route';

describe('organization member staff link route', () => {
  it('links staff member successfully', async () => {
    vi.mocked(requireOrganization).mockResolvedValue({
      user: { id: 'user-1', email: 'admin@example.com' },
      organization: {
        organizationId: 'org-1',
        organizationName: 'Org',
        userRole: 'admin',
      },
    });

    vi.mocked(getServices).mockResolvedValue({
      organizationService: {
        linkStaffMemberToOrganizationMember: vi.fn().mockResolvedValue({
          id: 'member-1',
          organizationId: 'org-1',
          userId: 'user-2',
          staffMemberId: 'staff-1',
          role: 'staff',
          isActive: true,
          invitedAt: new Date(),
        }),
      },
    } as any);

    const request = new Request('http://localhost/api/organizations/members/member-1/staff-link', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ staffMemberId: 'staff-1' }),
    });

    const response = await PUT(request as any, { params: Promise.resolve({ memberId: 'member-1' }) });
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.staffMemberId).toBe('staff-1');
  });

  it('returns conflict when staff is already linked', async () => {
    vi.mocked(requireOrganization).mockResolvedValue({
      user: { id: 'user-1', email: 'admin@example.com' },
      organization: {
        organizationId: 'org-1',
        organizationName: 'Org',
        userRole: 'admin',
      },
    });

    vi.mocked(getServices).mockResolvedValue({
      organizationService: {
        linkStaffMemberToOrganizationMember: vi
          .fn()
          .mockRejectedValue(new Error('Staff member is already linked to another organization member')),
      },
    } as any);

    const request = new Request('http://localhost/api/organizations/members/member-1/staff-link', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ staffMemberId: 'staff-1' }),
    });

    const response = await PUT(request as any, { params: Promise.resolve({ memberId: 'member-1' }) });
    const payload = await response.json();

    expect(response.status).toBe(409);
    expect(payload.error).toContain('already linked');
  });

  it('forbids unlink when user is not admin', async () => {
    vi.mocked(requireOrganization).mockResolvedValue({
      user: { id: 'user-1', email: 'teacher@example.com' },
      organization: {
        organizationId: 'org-1',
        organizationName: 'Org',
        userRole: 'teacher',
      },
    });

    const response = await DELETE({} as any, { params: Promise.resolve({ memberId: 'member-1' }) });
    const payload = await response.json();

    expect(response.status).toBe(403);
    expect(payload.error).toContain('Only organization admins');
  });
});
