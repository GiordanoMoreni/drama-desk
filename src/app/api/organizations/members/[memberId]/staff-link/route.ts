import { NextRequest, NextResponse } from 'next/server';
import { requireOrganization } from '@/lib/auth';
import { getServices } from '@/lib/di';

function mapErrorStatus(message: string): number {
  if (message.includes('not found')) return 404;
  if (message.includes('already linked')) return 409;
  if (message.includes('different organization')) return 400;
  if (message.includes('Only organization admins')) return 403;
  return 400;
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ memberId: string }> }
) {
  try {
    const { organization } = await requireOrganization();
    const { memberId } = await params;

    if (organization.userRole !== 'admin') {
      return NextResponse.json(
        { error: 'Only organization admins can link staff members' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const staffMemberId = typeof body.staffMemberId === 'string' ? body.staffMemberId : '';

    if (!staffMemberId) {
      return NextResponse.json(
        { error: 'staffMemberId is required' },
        { status: 400 }
      );
    }

    const services = await getServices();
    const updatedMember = await services.organizationService.linkStaffMemberToOrganizationMember(
      organization.organizationId,
      memberId,
      staffMemberId,
      organization.userRole
    );

    return NextResponse.json(updatedMember);
  } catch (error) {
    console.error('Error linking staff member:', error);

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: mapErrorStatus(error.message) }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ memberId: string }> }
) {
  try {
    const { organization } = await requireOrganization();
    const { memberId } = await params;

    if (organization.userRole !== 'admin') {
      return NextResponse.json(
        { error: 'Only organization admins can unlink staff members' },
        { status: 403 }
      );
    }

    const services = await getServices();
    const updatedMember = await services.organizationService.unlinkStaffMemberFromOrganizationMember(
      organization.organizationId,
      memberId,
      organization.userRole
    );

    return NextResponse.json(updatedMember);
  } catch (error) {
    console.error('Error unlinking staff member:', error);

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: mapErrorStatus(error.message) }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
