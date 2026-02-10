import { requireOrganization } from '@/lib/auth';
import { getOrganizationRepository } from '@/lib/di';

export async function GET() {
  try {
    const { organization } = await requireOrganization();

    const organizationRepository = await getOrganizationRepository();
    
    // Get organization members
    const members = await organizationRepository.getMembers(organization.organizationId);

    return Response.json(members);
  } catch (error) {
    console.error('Error fetching organization members:', error);
    return Response.json(
      { error: 'Failed to fetch organization members' },
      { status: 500 }
    );
  }
}
