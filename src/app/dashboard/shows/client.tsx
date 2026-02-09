'use client';

import { useState, useEffect } from 'react';
import { Show, OrganizationMember } from '@/domain/entities';
import { CreateShowFormData, UpdateShowFormData } from '@/lib/validations/show';
import { ShowForm } from '@/components/forms/show-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Plus, Edit, Trash2, Search, DollarSign } from 'lucide-react';
import { toast } from 'sonner';
import { t } from '@/lib/translations';

interface ShowsPageClientProps {
  organizationId: string;
}

interface ShowsResponse {
  data: Show[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function ShowsPageClient({ organizationId }: ShowsPageClientProps) {
  const [shows, setShows] = useState<Show[]>([]);
  const [directors, setDirectors] = useState<OrganizationMember[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingShow, setEditingShow] = useState<Show | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Fetch shows and directors on mount
  useEffect(() => {
    fetchShows();
    fetchDirectors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organizationId, searchTerm, statusFilter]);

  const fetchShows = async () => {
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter !== 'all') params.append('status', statusFilter);

      const response = await fetch(`/api/shows?${params}`);
      if (!response.ok) throw new Error('Failed to fetch shows');

      const data: ShowsResponse = await response.json();
      setShows(data.data);
    } catch (error) {
      console.error('Error fetching shows:', error);
      toast.error(t('errors.failedToFetch'));
    }
  };

  const fetchDirectors = async () => {
    try {
      // For now, we'll fetch organization members with admin/teacher roles
      // This should be replaced with a proper API endpoint
      const response = await fetch('/api/organizations/members');
      if (!response.ok) throw new Error('Failed to fetch directors');

      const data = await response.json();
      setDirectors(data.filter((member: OrganizationMember) =>
        member.role === 'admin' || member.role === 'teacher'
      ));
    } catch (error) {
      console.error('Error fetching directors:', error);
      // For demo purposes, we'll use empty array
      setDirectors([]);
    }
  };

  const handleCreateShow = async (data: CreateShowFormData | UpdateShowFormData) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/shows', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...data, organizationId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create show');
      }

      const newShow = await response.json();
      setShows(prev => [newShow, ...prev]);
      setIsCreateDialogOpen(false);
      toast.success(t('shows.showCreatedSuccess'));
    } catch (error) {
      console.error('Error creating show:', error);
      toast.error(error instanceof Error ? error.message : t('errors.failedToCreate'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateShow = async (data: CreateShowFormData | UpdateShowFormData) => {
    if (!editingShow) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/shows/${editingShow.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update show');
      }

      const updatedShow = await response.json();
      setShows(prev => prev.map(s => s.id === updatedShow.id ? updatedShow : s));
      setEditingShow(null);
      toast.success(t('shows.showUpdatedSuccess'));
    } catch (error) {
      console.error('Error updating show:', error);
      toast.error(error instanceof Error ? error.message : t('errors.failedToUpdate'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteShow = async (showId: string) => {
    if (!confirm(t('common.delete') + '?')) return;

    try {
      const response = await fetch(`/api/shows/${showId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete show');
      }

      setShows(prev => prev.filter(s => s.id !== showId));
      toast.success(t('shows.showDeletedSuccess'));
    } catch (error) {
      console.error('Error deleting show:', error);
      toast.error(error instanceof Error ? error.message : t('errors.failedToDelete'));
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'planning': return 'secondary';
      case 'rehearsing': return 'default';
      case 'performing': return 'default';
      case 'completed': return 'outline';
      case 'cancelled': return 'destructive';
      default: return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">{t('shows.title')}</h1>
          <p className="text-muted-foreground">{t('shows.description')}</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              {t('shows.addNewShow')}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogTitle>{t('shows.addNewShow')}</DialogTitle>
            <ShowForm
              onSubmit={handleCreateShow}
              isLoading={isLoading}
              organizationId={organizationId}
              directors={directors.map(d => ({
                id: d.id,
                firstName: 'Director', // This should be fetched from auth users
                lastName: d.id,
                email: 'director@example.com', // This should be fetched from auth users
              }))}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t('shows.title')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border rounded-md"
            >
              <option value="all">Tutti gli Stati</option>
              <option value="planning">{t('shows.planning')}</option>
              <option value="rehearsing">{t('shows.rehearsing')}</option>
              <option value="performing">{t('shows.performing')}</option>
              <option value="completed">Completato</option>
              <option value="cancelled">Cancellato</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Shows Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t('shows.title')} ({shows.length})</CardTitle>
          <CardDescription>
            {t('shows.description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('shows.showTitle')}</TableHead>
                <TableHead>{t('shows.director')}</TableHead>
                <TableHead>Stato</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Venue</TableHead>
                <TableHead>Budget</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {shows.map((show) => (
                <TableRow key={show.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{show.title}</div>
                      {show.description && (
                        <div className="text-sm text-muted-foreground line-clamp-1">{show.description}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {show.directorId ? (
                      <Badge variant="outline">Director Assigned</Badge>
                    ) : (
                      <Badge variant="secondary">No Director</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(show.status)}>
                      {show.status.charAt(0).toUpperCase() + show.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {show.startDate && show.endDate ? (
                        `${show.startDate.toLocaleDateString()} - ${show.endDate.toLocaleDateString()}`
                      ) : show.startDate ? (
                        `From ${show.startDate.toLocaleDateString()}`
                      ) : (
                        'No dates set'
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {show.venue || 'No venue set'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      <span>{show.budget ? `$${show.budget.toLocaleString()}` : 'No budget set'}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingShow(show)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteShow(show.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {shows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="text-muted-foreground">
                      No shows found. Create your first show to get started.
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editingShow} onOpenChange={() => setEditingShow(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogTitle>{t('shows.editShow')}</DialogTitle>
          {editingShow && (
            <ShowForm
              initialData={editingShow}
              onSubmit={handleUpdateShow}
              isLoading={isLoading}
              organizationId={organizationId}
              directors={directors.map(d => ({
                id: d.id,
                firstName: 'Director', // This should be fetched from auth users
                lastName: d.id,
                email: 'director@example.com', // This should be fetched from auth users
              }))}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}