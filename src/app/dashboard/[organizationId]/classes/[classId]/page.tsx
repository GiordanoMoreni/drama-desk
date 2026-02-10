export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireOrganization } from '@/lib/auth';
import { getServices } from '@/lib/di';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CalendarDays, Clock3, UserRound, Users } from 'lucide-react';

interface ClassDetailPageProps {
  params: Promise<{ organizationId: string; classId: string }>;
}

const dayLabels: Record<string, string> = {
  monday: 'Lunedì',
  tuesday: 'Martedì',
  wednesday: 'Mercoledì',
  thursday: 'Giovedì',
  friday: 'Venerdì',
  saturday: 'Sabato',
  sunday: 'Domenica',
};

const formatDate = (value?: Date) => {
  if (!value) return '-';
  return new Date(value).toLocaleDateString('it-IT');
};

export default async function ClassDetailPage({ params }: ClassDetailPageProps) {
  const { organization } = await requireOrganization();
  const { organizationId, classId } = await params;

  if (organization.organizationId !== organizationId) {
    notFound();
  }

  const services = await getServices();
  const classItem = await services.classService.getClassWithTeacher(classId, organizationId);

  if (!classItem) {
    notFound();
  }

  const scheduleDays = classItem.schedule?.days?.map((day) => dayLabels[day] || day).join(', ');
  const scheduleTime =
    classItem.schedule?.startTime && classItem.schedule?.endTime
      ? `${classItem.schedule.startTime} - ${classItem.schedule.endTime}`
      : undefined;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Dettaglio classe</p>
          <h1 className="text-3xl font-bold">{classItem.name}</h1>
        </div>
        <Button asChild variant="outline">
          <Link href={`/dashboard/${organizationId}/classes`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Torna alle classi
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            Informazioni principali
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p><span className="font-semibold">Nome:</span> {classItem.name}</p>
          {classItem.description && <p><span className="font-semibold">Descrizione:</span> {classItem.description}</p>}
          <p>
            <span className="font-semibold">Stato:</span>{' '}
            <Badge variant={classItem.isActive ? 'default' : 'secondary'}>
              {classItem.isActive ? 'Attiva' : 'Inattiva'}
            </Badge>
          </p>
          <p><span className="font-semibold">Periodo:</span> {formatDate(classItem.startDate)} - {formatDate(classItem.endDate)}</p>
          {classItem.teacher && (
            <p className="flex items-center gap-2">
              <UserRound className="h-4 w-4 text-muted-foreground" />
              <span>Insegnante: {classItem.teacher.firstName} {classItem.teacher.lastName}</span>
            </p>
          )}
          {(scheduleDays || scheduleTime) && (
            <p className="flex items-center gap-2">
              <Clock3 className="h-4 w-4 text-muted-foreground" />
              <span>{[scheduleDays, scheduleTime].filter(Boolean).join(' - ')}</span>
            </p>
          )}
          {classItem.maxStudents && (
            <p className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span>Max studenti: {classItem.maxStudents}</span>
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
