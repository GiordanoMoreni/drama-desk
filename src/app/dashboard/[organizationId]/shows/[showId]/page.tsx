export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireOrganization } from '@/lib/auth';
import { getServices } from '@/lib/di';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CalendarDays, MapPin, Sparkles, UserRound } from 'lucide-react';

interface ShowDetailPageProps {
  params: Promise<{ organizationId: string; showId: string }>;
}

const statusLabel: Record<string, string> = {
  planning: 'Pianificazione',
  rehearsing: 'Prove',
  performing: 'In scena',
  completed: 'Completato',
  cancelled: 'Annullato',
};

const formatDate = (value?: Date) => {
  if (!value) return '-';
  return new Date(value).toLocaleDateString('it-IT');
};

export default async function ShowDetailPage({ params }: ShowDetailPageProps) {
  const { organization } = await requireOrganization();
  const { organizationId, showId } = await params;

  if (organization.organizationId !== organizationId) {
    notFound();
  }

  const services = await getServices();
  const show = await services.showService.getShowWithDirector(showId, organizationId);

  if (!show) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Dettaglio spettacolo</p>
          <h1 className="text-3xl font-bold">{show.title}</h1>
        </div>
        <Button asChild variant="outline">
          <Link href={`/dashboard/${organizationId}/shows`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Torna agli spettacoli
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Informazioni principali
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p><span className="font-semibold">Titolo:</span> {show.title}</p>
          {show.description && <p><span className="font-semibold">Descrizione:</span> {show.description}</p>}
          <p>
            <span className="font-semibold">Stato:</span>{' '}
            <Badge variant="outline">{statusLabel[show.status] || show.status}</Badge>
          </p>
          <p className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
            <span>{formatDate(show.startDate)} - {formatDate(show.endDate)}</span>
          </p>
          {show.venue && (
            <p className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{show.venue}</span>
            </p>
          )}
          {show.director && (
            <p className="flex items-center gap-2">
              <UserRound className="h-4 w-4 text-muted-foreground" />
              <span>Regista: {show.director.firstName} {show.director.lastName}</span>
            </p>
          )}
          {show.budget !== undefined && (
            <p><span className="font-semibold">Budget:</span> € {show.budget}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
