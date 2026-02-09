import { requireOrganization } from '@/lib/auth';
import { createServerClient } from '@/infrastructure/db/supabase/server-client';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const month = parseInt(searchParams.get('month') || String(new Date().getMonth() + 1));
    const year = parseInt(searchParams.get('year') || String(new Date().getFullYear()));

    const supabase = await createServerClient();

    // Get the first and last day of the month
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);

    // Fetch classes for this month
    const { data: classes, error: classError } = await supabase
      .from('classes')
      .select(`
        id,
        name,
        start_date,
        schedule
      `)
      .gte('start_date', firstDay.toISOString())
      .lte('start_date', lastDay.toISOString());

    if (classError) throw classError;

    // Fetch shows for this month
    const { data: shows, error: showError } = await supabase
      .from('shows')
      .select(`
        id,
        name,
        start_date,
        end_date
      `)
      .gte('start_date', firstDay.toISOString())
      .lte('start_date', lastDay.toISOString());

    if (showError) throw showError;

    // Format events
    const events = [
      ...(classes || []).map((cls: any) => ({
        id: `class-${cls.id}`,
        title: cls.name,
        type: 'class',
        date: new Date(cls.start_date),
        startTime: cls.schedule?.startTime || undefined,
      })),
      ...(shows || []).map((show: any) => ({
        id: `show-${show.id}`,
        title: show.name,
        type: 'show',
        date: new Date(show.start_date),
        startTime: undefined,
      })),
    ];

    // Sort by date
    events.sort((a, b) => a.date.getTime() - b.date.getTime());

    return NextResponse.json(events);
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch calendar events' },
      { status: 500 }
    );
  }
}
