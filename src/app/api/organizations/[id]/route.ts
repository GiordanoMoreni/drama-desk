import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { getServices } from '@/lib/di';
import { UpdateOrganizationFormData } from '@/lib/validations/organization';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const { id: organizationId } = await params;

    const services = await getServices();

    const organization = await services.organizationService.getOrganizationById(organizationId);

    if (!organization) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(organization);
  } catch (error) {
    console.error('Error fetching organization:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const { id: organizationId } = await params;

    const body: UpdateOrganizationFormData = await request.json();

    // Convert null values to undefined for compatibility with domain types
    const updateData = {
      ...body,
      logoUrl: body.logoUrl === null ? undefined : body.logoUrl,
      websiteUrl: body.websiteUrl === null ? undefined : body.websiteUrl,
      contactEmail: body.contactEmail === null ? undefined : body.contactEmail,
      contactPhone: body.contactPhone === null ? undefined : body.contactPhone,
      address: body.address === null ? undefined : body.address,
      city: body.city === null ? undefined : body.city,
      state: body.state === null ? undefined : body.state,
      postalCode: body.postalCode === null ? undefined : body.postalCode,
      country: body.country === null ? undefined : body.country,
    };

    const services = await getServices();

    const updatedOrganization = await services.organizationService.updateOrganization(organizationId, updateData);

    if (!updatedOrganization) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedOrganization);
  } catch (error) {
    console.error('Error updating organization:', error);

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const { id: organizationId } = await params;

    const services = await getServices();

    const deleted = await services.organizationService.deleteOrganization(organizationId);

    if (!deleted) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting organization:', error);

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
