import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { getServices } from '@/lib/di';
import { CreateOrganizationFormData } from '@/lib/validations/organization';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || undefined;
    const isActive = searchParams.get('isActive') === 'true' ? true :
                    searchParams.get('isActive') === 'false' ? false : undefined;

    const services = await getServices();

    const result = await services.organizationService.getOrganizations(undefined, {
      search,
      isActive,
    }, { page, limit });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching organizations:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();

    const body: CreateOrganizationFormData = await request.json();

    const services = await getServices();

    const organization = await services.organizationService.createOrganization(body, user.id);

    return NextResponse.json(organization, { status: 201 });
  } catch (error) {
    console.error('Error creating organization:', error);

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