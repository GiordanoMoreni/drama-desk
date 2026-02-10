import { requireOrganization } from '@/lib/auth';
import { createServerClient } from '@/infrastructure/db/supabase/server-client';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { organization } = await requireOrganization();
    const searchParams = request.nextUrl.searchParams;
    const month = parseInt(searchParams.get('month') || String(new Date().getMonth() + 1));
    const year = parseInt(searchParams.get('year') || String(new Date().getFullYear()));

    const supabase = await createServerClient();
    const formatDateOnly = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    const parseDateOnly = (value: string) => {
      const [year, month, day] = value.split('-').map(Number);
      return new Date(year, month - 1, day);
    };

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
        end_date,
        schedule
      `)
      .eq('organization_id', organization.organizationId)
      .lte('start_date', lastDay.toISOString())
      .or(`end_date.gte.${firstDay.toISOString()},end_date.is.null`);

    if (classError) throw classError;

    // Fetch shows for this month
    const { data: shows, error: showError } = await supabase
      .from('shows')
      .select(`
        id,
        title,
        start_date,
        end_date
      `)
      .eq('organization_id', organization.organizationId)
      .lte('start_date', lastDay.toISOString())
      .or(`end_date.gte.${firstDay.toISOString()},end_date.is.null`);

    if (showError) throw showError;

    // Format events
    const events = [
      ...(classes || []).flatMap((cls: {
        id: string;
        name: string;
        start_date: string;
        end_date: string | null;
        schedule?: { days?: string[]; startTime?: string };
      }) => {
        const classStart = parseDateOnly(cls.start_date);
        const classEnd = cls.end_date ? parseDateOnly(cls.end_date) : parseDateOnly(cls.start_date);

        const visibleStart = classStart < firstDay ? new Date(firstDay) : new Date(classStart);
        const visibleEnd = classEnd > lastDay ? new Date(lastDay) : new Date(classEnd);
        visibleStart.setHours(0, 0, 0, 0);
        visibleEnd.setHours(0, 0, 0, 0);

        const dayMap: Record<string, number> = {
          sunday: 0,
          monday: 1,
          tuesday: 2,
          wednesday: 3,
          thursday: 4,
          friday: 5,
          saturday: 6,
        };

        const scheduleDays = (cls.schedule?.days || [])
          .map((day) => dayMap[day])
          .filter((day) => day !== undefined);

        const classEvents: Array<{ id: string; title: string; type: 'class'; date: string; startTime?: string }> = [];

        if (scheduleDays.length === 0) {
          if (classStart >= firstDay && classStart <= lastDay) {
            classEvents.push({
              id: `class-${cls.id}-${formatDateOnly(classStart)}`,
              title: cls.name,
              type: 'class',
              date: formatDateOnly(classStart),
              startTime: cls.schedule?.startTime || undefined,
            });
          }
          return classEvents;
        }

        const cursor = new Date(visibleStart);
        while (cursor <= visibleEnd) {
          if (scheduleDays.includes(cursor.getDay())) {
            classEvents.push({
              id: `class-${cls.id}-${formatDateOnly(cursor)}`,
              title: cls.name,
              type: 'class',
              date: formatDateOnly(cursor),
              startTime: cls.schedule?.startTime || undefined,
            });
          }
          cursor.setDate(cursor.getDate() + 1);
        }

        return classEvents;
      }),
      ...(shows || []).flatMap((show: {
        id: string;
        title: string;
        start_date: string;
        end_date: string | null;
      }) => {
        const start = parseDateOnly(show.start_date);
        const end = show.end_date ? parseDateOnly(show.end_date) : parseDateOnly(show.start_date);

        // Clip show duration to current visible month
        const visibleStart = start < firstDay ? firstDay : start;
        const visibleEnd = end > lastDay ? lastDay : end;

        const showEvents: Array<{ id: string; title: string; type: 'show'; date: string; startTime?: string }> = [];
        const cursor = new Date(visibleStart);
        cursor.setHours(0, 0, 0, 0);
        visibleEnd.setHours(0, 0, 0, 0);

        while (cursor <= visibleEnd) {
          showEvents.push({
            id: `show-${show.id}-${formatDateOnly(cursor)}`,
            title: show.title,
            type: 'show',
            date: formatDateOnly(cursor),
            startTime: undefined,
          });
          cursor.setDate(cursor.getDate() + 1);
        }

        return showEvents;
      }),
    ];

    // Sort by date
    events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return NextResponse.json(events);
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch calendar events' },
      { status: 500 }
    );
  }
}
