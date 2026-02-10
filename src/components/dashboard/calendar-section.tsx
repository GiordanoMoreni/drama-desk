'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, ArrowUpRight, Clock3, MapPin, UserRound, Sparkles } from 'lucide-react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useRouter } from 'next/navigation';

interface CalendarEvent {
  id: string;
  title: string;
  type: 'class' | 'show';
  date: string;
  startTime?: string;
}

interface CalendarEventDetail {
  id?: string;
  type?: 'class' | 'show';
  title: string;
  description?: string;
  venue?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  teacherName?: string;
  directorName?: string;
  scheduleText?: string;
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
  const router = useRouter();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [selectedEventDetail, setSelectedEventDetail] = useState<CalendarEventDetail | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

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

  const dayNames: Record<string, string> = {
    monday: 'Lunedì',
    tuesday: 'Martedì',
    wednesday: 'Mercoledì',
    thursday: 'Giovedì',
    friday: 'Venerdì',
    saturday: 'Sabato',
    sunday: 'Domenica',
  };

  const formatDate = (value?: string) => {
    if (!value) return '-';
    const safeDate = value.includes('T') ? new Date(value) : new Date(`${value}T00:00:00`);
    if (Number.isNaN(safeDate.getTime())) return value;
    return safeDate.toLocaleDateString('it-IT');
  };

  const parseEntityIdFromEvent = (event: CalendarEvent) => {
    const prefix = `${event.type}-`;
    if (!event.id.startsWith(prefix)) return null;

    // Event IDs are generated as "{type}-{entityId}-YYYY-MM-DD".
    const raw = event.id.slice(prefix.length);
    if (raw.length <= 11) return null;

    return raw.slice(0, -11);
  };

  const buildClassScheduleText = (schedule?: { days?: string[]; startTime?: string; endTime?: string }) => {
    if (!schedule) return undefined;
    const days = (schedule.days || []).map((day) => dayNames[day] || day).join(', ');
    const time = schedule.startTime && schedule.endTime ? `${schedule.startTime} - ${schedule.endTime}` : '';
    const value = [days, time].filter(Boolean).join(' ');
    return value || undefined;
  };

  const openEventPreview = async (event: CalendarEvent) => {
    setSelectedEvent(event);
    setSelectedEventDetail(null);
    setIsDetailLoading(true);

    try {
      const entityId = parseEntityIdFromEvent(event);
      if (!entityId) {
        setSelectedEventDetail({
          id: undefined,
          type: event.type,
          title: event.title,
          startDate: event.date,
        });
        return;
      }

      if (event.type === 'class') {
        const response = await fetch(`/api/classes/${entityId}`);
        if (!response.ok) throw new Error('Errore nel caricamento classe');
        const data = await response.json();

        setSelectedEventDetail({
          id: entityId,
          type: 'class',
          title: data.name || event.title,
          description: data.description || undefined,
          startDate: data.startDate || event.date,
          endDate: data.endDate || undefined,
          teacherName: data.teacher ? `${data.teacher.firstName} ${data.teacher.lastName}`.trim() : undefined,
          scheduleText: buildClassScheduleText(data.schedule),
          status: data.isActive ? 'Attiva' : 'Inattiva',
        });
        return;
      }

      const response = await fetch(`/api/shows/${entityId}`);
      if (!response.ok) throw new Error('Errore nel caricamento spettacolo');
      const data = await response.json();

      setSelectedEventDetail({
        id: entityId,
        type: 'show',
        title: data.title || event.title,
        description: data.description || undefined,
        venue: data.venue || undefined,
        status: data.status || undefined,
        startDate: data.startDate || event.date,
        endDate: data.endDate || undefined,
        directorName: data.director ? `${data.director.firstName} ${data.director.lastName}`.trim() : undefined,
      });
    } catch (error) {
      console.error('Error loading calendar event details:', error);
      setSelectedEventDetail({
        id: undefined,
        type: event.type,
        title: event.title,
        startDate: event.date,
      });
    } finally {
      setIsDetailLoading(false);
    }
  };

  const openDetailPage = () => {
    if (!selectedEventDetail?.id || !selectedEventDetail.type) return;

    if (selectedEventDetail.type === 'class') {
      router.push(`/dashboard/${organizationId}/classes/${selectedEventDetail.id}`);
      return;
    }

    router.push(`/dashboard/${organizationId}/shows/${selectedEventDetail.id}`);
  };

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
                              <button
                                key={event.id}
                                type="button"
                                className={`text-[10px] leading-tight px-1.5 py-1 rounded border-l-2 w-full text-left cursor-pointer ${style.line}`}
                                title={`${style.label}: ${event.title}`}
                                onClick={() => openEventPreview(event)}
                              >
                                <span className="flex items-center gap-1 min-w-0">
                                  <span className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${style.dot}`} />
                                  <span className="truncate font-medium">
                                    {style.label}: {event.title}
                                  </span>
                                </span>
                                {event.startTime && <span className="text-[10px] opacity-75 pl-3">{event.startTime}</span>}
                              </button>
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

      <Dialog open={Boolean(selectedEvent)} onOpenChange={(open) => !open && setSelectedEvent(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedEvent?.type === 'class' ? 'Anteprima classe' : 'Anteprima spettacolo'}
            </DialogTitle>
          </DialogHeader>

          {isDetailLoading ? (
            <p className="text-sm text-gray-600">Caricamento dettagli...</p>
          ) : selectedEventDetail ? (
            <div className="space-y-4 text-sm">
              <div className="rounded-xl border p-4 bg-gradient-to-br from-blue-50 to-white shadow-sm">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-500 flex items-center gap-1">
                      <Sparkles className="h-3.5 w-3.5" />
                      {selectedEventDetail.type === 'class' ? 'Classe' : 'Spettacolo'}
                    </p>
                    <h3 className="font-semibold text-base text-gray-900 mt-1">{selectedEventDetail.title}</h3>
                  </div>
                  {selectedEventDetail.status && (
                    <Badge variant="outline" className="capitalize">{selectedEventDetail.status}</Badge>
                  )}
                </div>
              </div>

              <div className="rounded-lg border p-3 bg-white space-y-2">
                <p className="flex items-center gap-2 text-gray-700">
                  <CalendarIcon className="h-4 w-4 text-blue-600" />
                  <span>
                    {formatDate(selectedEventDetail.startDate)}
                    {selectedEventDetail.endDate ? ` - ${formatDate(selectedEventDetail.endDate)}` : ''}
                  </span>
                </p>
                {selectedEventDetail.scheduleText && (
                  <p className="flex items-center gap-2 text-gray-700">
                    <Clock3 className="h-4 w-4 text-blue-600" />
                    <span>{selectedEventDetail.scheduleText}</span>
                  </p>
                )}
                {selectedEventDetail.teacherName && (
                  <p className="flex items-center gap-2 text-gray-700">
                    <UserRound className="h-4 w-4 text-blue-600" />
                    <span>Insegnante: {selectedEventDetail.teacherName}</span>
                  </p>
                )}
                {selectedEventDetail.directorName && (
                  <p className="flex items-center gap-2 text-gray-700">
                    <UserRound className="h-4 w-4 text-blue-600" />
                    <span>Regista: {selectedEventDetail.directorName}</span>
                  </p>
                )}
                {selectedEventDetail.venue && (
                  <p className="flex items-center gap-2 text-gray-700">
                    <MapPin className="h-4 w-4 text-blue-600" />
                    <span>{selectedEventDetail.venue}</span>
                  </p>
                )}
              </div>

              {selectedEventDetail.description && (
                <div className="rounded-lg border p-3 bg-white">
                  <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Descrizione</p>
                  <p className="text-gray-700">{selectedEventDetail.description}</p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-600">Dettagli non disponibili.</p>
          )}

          <DialogFooter>
            <Button
              type="button"
              className="w-full"
              onClick={openDetailPage}
              disabled={!selectedEventDetail?.id || isDetailLoading}
            >
              Vai al dettaglio
              <ArrowUpRight className="h-4 w-4 ml-1" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
