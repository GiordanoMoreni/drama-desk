import { NextRequest, NextResponse } from 'next/server';
import { setCurrentOrganization } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('org');

    if (!organizationId) {
      return NextResponse.redirect(new URL('/organizations/select', request.url));
    }

    // Set the organization and redirect to dashboard
    await setCurrentOrganization(organizationId);
    return NextResponse.redirect(new URL('/dashboard', request.url));
  } catch (error) {
    console.error('Error in auto-select:', error);
    return NextResponse.redirect(new URL('/organizations/select', request.url));
  }
}