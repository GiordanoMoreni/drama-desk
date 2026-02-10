'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

interface CalendarEvent {
  id: string;
  title: string;
  type: 'class' | 'show';
  date: string;
  startTime?: string;
}

interface CalendarSectionProps {
  organizationId: string;
}

const daysOfWeek = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];
const months = [
  'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
  'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
];

export default function CalendarSection({ organizationId }: CalendarSectionProps) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/calendar/events?organizationId=${organizationId}&month=${currentDate.getMonth() + 1}&year=${currentDate.getFullYear()}`
        );
        if (response.ok) {
          const data: CalendarEvent[] = await response.json();
          setEvents(data);
        }
      } catch (error) {
        console.error('Error fetching calendar events:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [organizationId, currentDate]);

  const getDaysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();

  const getFirstDayOfMonth = (date: Date) => {
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    return firstDay === 0 ? 6 : firstDay - 1;
  };

  const toDateKey = (value: Date | string) => {
    if (typeof value === 'string') {
      if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
      if (value.includes('T')) return value.split('T')[0];
    }

    const date = value instanceof Date ? value : new Date(value);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const previousMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));

  const getEventsForDate = (day: number) => {
    const dayKey = toDateKey(new Date(currentDate.getFullYear(), currentDate.getMonth(), day));
    return events.filter(event => toDateKey(event.date) === dayKey);
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const days: Array<number | null> = [];

  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  const eventStyles: Record<'class' | 'show', { line: string; dot: string; label: string }> = {
    class: {
      line: 'border-l-blue-500 bg-blue-50/80 text-blue-950',
      dot: 'bg-blue-500',
      label: 'Classe',
    },
    show: {
      line: 'border-l-amber-500 bg-amber-50/80 text-amber-950',
      dot: 'bg-amber-500',
      label: 'Spettacolo',
    },
  };

  return (
    <Card className="mb-8">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <CalendarIcon className="h-6 w-6" />
              Calendario
            </CardTitle>
            <CardDescription>Visualizza tutti i tuoi impegni (classi e spettacoli)</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={previousMonth} className="gap-1">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="px-4 py-1 text-center min-w-[200px] font-semibold">
              {months[currentDate.getMonth()]} {currentDate.getFullYear()}
            </div>
            <Button variant="outline" size="sm" onClick={nextMonth} className="gap-1">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-gray-600">Caricamento calendario...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-7 gap-1 mb-2">
              {daysOfWeek.map(day => (
                <div key={day} className="text-center font-semibold text-sm text-gray-600 py-2">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1 bg-gray-50 p-2 rounded-lg">
              {days.map((day, index) => {
                const dayEvents = day ? getEventsForDate(day) : [];
                const isToday =
                  day &&
                  day === new Date().getDate() &&
                  currentDate.getMonth() === new Date().getMonth() &&
                  currentDate.getFullYear() === new Date().getFullYear();

                return (
                  <div
                    key={index}
                    className={`
                      min-h-[120px] p-2 rounded-lg border transition-colors overflow-hidden
                      ${day
                        ? `bg-white border-gray-200 hover:border-blue-300 hover:shadow-sm
                           ${isToday ? 'border-blue-400 bg-blue-50' : ''}
                           ${dayEvents.length > 0 ? 'ring-1 ring-blue-100' : ''}`
                        : 'bg-gray-100 border-gray-100'
                      }
                    `}
                  >
                    {day && (
                      <>
                        <div className={`text-sm font-semibold mb-1 ${isToday ? 'text-blue-600' : 'text-gray-900'}`}>{day}</div>

                        <div className="space-y-1">
                          {dayEvents.slice(0, 3).map(event => {
                            const style = eventStyles[event.type];
                            return (
                              <div key={event.id} className={`text-[10px] leading-tight px-1.5 py-1 rounded border-l-2 ${style.line}`} title={event.title}>
                                <span className="flex items-center gap-1 min-w-0">
                                  <span className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${style.dot}`} />
                                  <span className="truncate font-medium">
                                    {style.label}: {event.title}
                                  </span>
                                </span>
                                {event.startTime && <span className="text-[10px] opacity-75 pl-3">{event.startTime}</span>}
                              </div>
                            );
                          })}
                          {dayEvents.length > 3 && (
                            <div className="text-xs text-gray-500 px-1 font-medium">+{dayEvents.length - 3} altri</div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex gap-6 pt-4 border-t">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-blue-200"></div>
                <span className="text-sm text-gray-600">Classi</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-amber-200"></div>
                <span className="text-sm text-gray-600">Spettacoli</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
