import { NextRequest, NextResponse } from 'next/server';
import { requireOrganization } from '@/lib/auth';
import { getStaffService } from '@/lib/di';
import { UpdateStaffFormData } from '@/lib/validations/staff';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { organization } = await requireOrganization();
    const { id } = await params;

    const staffService = await getStaffService();
    const staffMember = await staffService.getStaffMemberById(id, organization.organizationId);
    if (!staffMember) {
      return NextResponse.json({ error: 'Staff member not found' }, { status: 404 });
    }

    return NextResponse.json(staffMember);
  } catch (error) {
    console.error('Error fetching staff member:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { organization } = await requireOrganization();
    const { id } = await params;
    const data: UpdateStaffFormData = await request.json();

    const staffService = await getStaffService();
    const updated = await staffService.updateStaffMember(id, data, organization.organizationId);
    if (!updated) {
      return NextResponse.json({ error: 'Staff member not found' }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating staff member:', error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { organization } = await requireOrganization();
    const { id } = await params;

    const staffService = await getStaffService();
    const success = await staffService.deleteStaffMember(id, organization.organizationId);
    if (!success) {
      return NextResponse.json({ error: 'Staff member not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting staff member:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
