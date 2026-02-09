import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { createServerClient } from '@/infrastructure/db/supabase/server-client';

export async function GET() {
  const user = await requireAuth();

  const supabase = await createServerClient();

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return NextResponse.json({ user, profile });
}

export async function PUT(request: Request) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const { firstName, lastName, email, password } = body;

    const supabase = await createServerClient();

    // Update auth user (email / password)
    if (email || password) {
      const updatePayload: any = {};
      if (email) updatePayload.email = email;
      if (password) updatePayload.password = password;

      const { error: authError } = await supabase.auth.updateUser(updatePayload);
      if (authError) {
        console.error('Error updating auth user:', authError);
        return NextResponse.json({ error: authError.message }, { status: 400 });
      }
    }

    // Upsert into user_profiles
    const profilePayload: any = { id: user.id };
    if (firstName !== undefined) profilePayload.first_name = firstName;
    if (lastName !== undefined) profilePayload.last_name = lastName;
    if (email !== undefined) profilePayload.email = email;

    const { error: profileError } = await supabase
      .from('user_profiles')
      .upsert(profilePayload);

    if (profileError) {
      console.error('Error upserting user_profiles:', profileError);
      return NextResponse.json({ error: profileError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Unexpected error in profile PUT:', error);
    return NextResponse.json({ error: error?.message || 'Unexpected error' }, { status: 500 });
  }
}
