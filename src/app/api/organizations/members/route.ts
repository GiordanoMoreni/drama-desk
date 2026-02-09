import { requireOrganization } from '@/lib/auth';
import { getOrganizationRepository } from '@/lib/di';
import { OrganizationMember } from '@/domain/entities';

export async function GET(request: Request) {
  try {
    const { organization } = await requireOrganization();

    const organizationRepository = await getOrganizationRepository();
    
    // Get organization members (if the repository has a method for this)
    // For now, return an empty array as demo
    // In the future, you might want to add a getMembers method to the repository
    const members: OrganizationMember[] = [];

    return Response.json(members);
  } catch (error) {
    console.error('Error fetching organization members:', error);
    return Response.json(
      { error: 'Failed to fetch organization members' },
      { status: 500 }
    );
  }
}
