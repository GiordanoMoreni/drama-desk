'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

interface CalendarEvent {
  id: string;
  title: string;
  type: 'class' | 'show';
  date: Date;
  startTime?: string;
  endTime?: string;
  color?: string;
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
        const response = await fetch(`/api/calendar/events?organizationId=${organizationId}&month=${currentDate.getMonth() + 1}&year=${currentDate.getFullYear()}`);
        if (response.ok) {
          const data = await response.json();
          setEvents(data.map((e: any) => ({
            ...e,
            date: new Date(e.date)
          })));
        }
      } catch (error) {
        console.error('Error fetching calendar events:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [organizationId, currentDate]);

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    return firstDay === 0 ? 6 : firstDay - 1; // Convert to Monday = 0
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const getEventsForDate = (day: number) => {
    const dateStr = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
      .toISOString()
      .split('T')[0];
    return events.filter(e => e.date.toISOString().split('T')[0] === dateStr);
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const days = [];

  // Empty cells for days before month starts
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }

  // Days of the month
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const typeColors: Record<string, { bg: string; text: string; badge: string }> = {
    class: {
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      badge: 'bg-blue-100 text-blue-800'
    },
    show: {
      bg: 'bg-purple-50',
      text: 'text-purple-700',
      badge: 'bg-purple-100 text-purple-800'
    }
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
            <CardDescription>
              Visualizza tutti i tuoi impegni (classi e spettacoli)
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={previousMonth}
              className="gap-1"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="px-4 py-1 text-center min-w-[200px] font-semibold">
              {months[currentDate.getMonth()]} {currentDate.getFullYear()}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={nextMonth}
              className="gap-1"
            >
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
            {/* Days of week header */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {daysOfWeek.map(day => (
                <div
                  key={day}
                  className="text-center font-semibold text-sm text-gray-600 py-2"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
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
                      min-h-[120px] p-2 rounded-lg border transition-colors
                      ${day
                        ? `bg-white border-gray-200 hover:border-blue-300 hover:shadow-sm cursor-pointer
                           ${isToday ? 'border-blue-400 bg-blue-50' : ''}`
                        : 'bg-gray-100 border-gray-100'
                      }
                    `}
                  >
                    {day && (
                      <>
                        <div className={`
                          text-sm font-semibold mb-1
                          ${isToday ? 'text-blue-600' : 'text-gray-900'}
                        `}>
                          {day}
                        </div>

                        {/* Events */}
                        <div className="space-y-1">
                          {dayEvents.length > 0 ? (
                            dayEvents.slice(0, 3).map(event => {
                              const colors = typeColors[event.type] || typeColors.class;
                              return (
                                <div
                                  key={event.id}
                                  className={`text-xs p-1 rounded ${colors.badge} truncate`}
                                  title={event.title}
                                >
                                  <span className="block truncate font-medium">
                                    {event.type === 'class' ? '🎭' : '🎬'} {event.title}
                                  </span>
                                  {event.startTime && (
                                    <span className="text-xs opacity-75">
                                      {event.startTime}
                                    </span>
                                  )}
                                </div>
                              );
                            })
                          ) : null}
                          {dayEvents.length > 3 && (
                            <div className="text-xs text-gray-500 px-1 font-medium">
                              +{dayEvents.length - 3} altri
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex gap-6 pt-4 border-t">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-blue-200"></div>
                <span className="text-sm text-gray-600">Classi</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-purple-200"></div>
                <span className="text-sm text-gray-600">Spettacoli</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
