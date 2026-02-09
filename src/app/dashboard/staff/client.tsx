'use client';

import { useEffect, useState } from 'react';
import { StaffMember } from '@/domain/entities';
import { StaffForm } from '@/components/forms/staff-form';
import { CreateStaffFormData, UpdateStaffFormData } from '@/lib/validations/staff';
import { getStaffRoleLabel } from '@/lib/staff-roles';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { toast } from 'sonner';

interface StaffResponse {
  data: StaffMember[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface StaffPageClientProps {
  organizationId: string;
}

export function StaffPageClient({ organizationId }: StaffPageClientProps) {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<StaffMember | null>(null);

  useEffect(() => {
    fetchStaff();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organizationId, searchTerm]);

  const fetchStaff = async () => {
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      const response = await fetch(`/api/staff?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch staff');
      const data: StaffResponse = await response.json();
      setStaff(data.data);
    } catch {
      toast.error('Errore nel caricamento dello staff');
    }
  };

  const handleCreate = async (data: CreateStaffFormData | UpdateStaffFormData) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, organizationId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create staff member');
      }

      const created = await response.json();
      setStaff(prev => [created, ...prev]);
      setIsCreateDialogOpen(false);
      toast.success('Membro staff creato');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Errore creazione staff');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async (data: CreateStaffFormData | UpdateStaffFormData) => {
    if (!editingMember) return;
    setIsLoading(true);
    try {
      const response = await fetch(`/api/staff/${editingMember.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update staff member');
      }

      const updated = await response.json();
      setStaff(prev => prev.map(member => (member.id === updated.id ? updated : member)));
      setEditingMember(null);
      toast.success('Membro staff aggiornato');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Errore aggiornamento staff');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Eliminare questo membro staff?')) return;

    try {
      const response = await fetch(`/api/staff/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete staff member');
      setStaff(prev => prev.filter(member => member.id !== id));
      toast.success('Membro staff eliminato');
    } catch {
      toast.error('Errore eliminazione staff');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Staff</h1>
          <p className="text-muted-foreground">Definisci insegnanti, registi, tecnici, assistenti e altri ruoli di produzione.</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nuovo membro staff
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogTitle>Nuovo membro staff</DialogTitle>
            <StaffForm onSubmit={handleCreate} isLoading={isLoading} />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cerca per nome o email"
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Elenco staff ({staff.length})</CardTitle>
          <CardDescription>Lo staff potrà essere assegnato ai nuovi spettacoli.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Contatti</TableHead>
                <TableHead>Ruolo principale</TableHead>
                <TableHead>Stato</TableHead>
                <TableHead>Azioni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {staff.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="font-medium">{member.firstName} {member.lastName}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{member.email || 'N/A'}</div>
                      <div className="text-muted-foreground">{member.phone || ''}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{getStaffRoleLabel(member.primaryRole)}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={member.isActive ? 'default' : 'secondary'}>
                      {member.isActive ? 'Attivo' : 'Inattivo'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => setEditingMember(member)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDelete(member.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {staff.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    Nessun membro staff trovato.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={Boolean(editingMember)} onOpenChange={() => setEditingMember(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogTitle>Modifica membro staff</DialogTitle>
          {editingMember && (
            <StaffForm initialData={editingMember} onSubmit={handleUpdate} isLoading={isLoading} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
