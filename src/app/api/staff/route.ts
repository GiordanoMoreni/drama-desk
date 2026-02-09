import { NextRequest, NextResponse } from 'next/server';
import { requireOrganization } from '@/lib/auth';
import { getStaffService } from '@/lib/di';
import { CreateStaffFormData } from '@/lib/validations/staff';

export async function GET(request: NextRequest) {
  try {
    const { organization } = await requireOrganization();
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const search = searchParams.get('search') || undefined;
    const isActive =
      searchParams.get('isActive') === 'true'
        ? true
        : searchParams.get('isActive') === 'false'
          ? false
          : undefined;

    const staffService = await getStaffService();
    const result = await staffService.getStaffMembers(
      organization.organizationId,
      { search, isActive },
      { page, limit }
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching staff:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { organization } = await requireOrganization();
    const body: CreateStaffFormData & { organizationId: string } = await request.json();

    if (body.organizationId !== organization.organizationId) {
      return NextResponse.json({ error: 'Organization ID mismatch' }, { status: 403 });
    }

    const { organizationId, ...staffData } = body;

    const staffService = await getStaffService();
    const created = await staffService.createStaffMember(staffData, organizationId);
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error('Error creating staff member:', error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
