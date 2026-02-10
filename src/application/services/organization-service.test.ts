import { describe, expect, it, vi } from 'vitest';
import { OrganizationRepository } from '@/domain/repositories';
import { OrganizationService } from './organization-service';

function createRepositoryMock(overrides: Partial<OrganizationRepository> = {}): OrganizationRepository {
  return {
    findById: vi.fn(),
    findAll: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    exists: vi.fn(),
    findBySlug: vi.fn(),
    findByUserId: vi.fn(),
    addMember: vi.fn(),
    updateMemberRole: vi.fn(),
    getMemberById: vi.fn(),
    getActiveStaffMemberById: vi.fn(),
    findMemberByStaffMemberId: vi.fn(),
    linkStaffMember: vi.fn(),
    unlinkStaffMember: vi.fn(),
    removeMember: vi.fn(),
    getMembers: vi.fn(),
    getUserRole: vi.fn(),
    isMember: vi.fn(),
    ...overrides,
  } as unknown as OrganizationRepository;
}

describe('OrganizationService - staff/member linking', () => {
  it('rejects link when user is not admin', async () => {
    const repository = createRepositoryMock();
    const service = new OrganizationService(repository);

    await expect(
      service.linkStaffMemberToOrganizationMember('org-1', 'member-1', 'staff-1', 'teacher')
    ).rejects.toThrow('Only organization admins');
  });

  it('rejects link when staff belongs to a different organization', async () => {
    const repository = createRepositoryMock({
      getMemberById: vi.fn().mockResolvedValue({
        id: 'member-1',
        organizationId: 'org-1',
        userId: 'user-1',
        role: 'staff',
        isActive: true,
        invitedAt: new Date(),
      }),
      getActiveStaffMemberById: vi.fn().mockResolvedValue({
        id: 'staff-1',
        organizationId: 'org-2',
        isActive: true,
      }),
    });
    const service = new OrganizationService(repository);

    await expect(
      service.linkStaffMemberToOrganizationMember('org-1', 'member-1', 'staff-1', 'admin')
    ).rejects.toThrow('different organization');
  });

  it('rejects link when staff is already linked to another member', async () => {
    const repository = createRepositoryMock({
      getMemberById: vi.fn().mockResolvedValue({
        id: 'member-1',
        organizationId: 'org-1',
        userId: 'user-1',
        role: 'staff',
        isActive: true,
        invitedAt: new Date(),
      }),
      getActiveStaffMemberById: vi.fn().mockResolvedValue({
        id: 'staff-1',
        organizationId: 'org-1',
        isActive: true,
      }),
      findMemberByStaffMemberId: vi.fn().mockResolvedValue({
        id: 'member-2',
        organizationId: 'org-1',
        userId: 'user-2',
        role: 'staff',
        isActive: true,
        invitedAt: new Date(),
      }),
    });
    const service = new OrganizationService(repository);

    await expect(
      service.linkStaffMemberToOrganizationMember('org-1', 'member-1', 'staff-1', 'admin')
    ).rejects.toThrow('already linked');
  });

  it('links staff member when validation passes', async () => {
    const repository = createRepositoryMock({
      getMemberById: vi.fn().mockResolvedValue({
        id: 'member-1',
        organizationId: 'org-1',
        userId: 'user-1',
        role: 'staff',
        isActive: true,
        invitedAt: new Date(),
      }),
      getActiveStaffMemberById: vi.fn().mockResolvedValue({
        id: 'staff-1',
        organizationId: 'org-1',
        isActive: true,
      }),
      findMemberByStaffMemberId: vi.fn().mockResolvedValue(null),
      linkStaffMember: vi.fn().mockResolvedValue({
        id: 'member-1',
        organizationId: 'org-1',
        userId: 'user-1',
        staffMemberId: 'staff-1',
        role: 'staff',
        isActive: true,
        invitedAt: new Date(),
      }),
    });
    const service = new OrganizationService(repository);

    const result = await service.linkStaffMemberToOrganizationMember('org-1', 'member-1', 'staff-1', 'admin');

    expect(result.staffMemberId).toBe('staff-1');
  });
});
