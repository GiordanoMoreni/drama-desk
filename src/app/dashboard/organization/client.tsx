'use client';

import { useState, useEffect } from 'react';
import { Organization, OrganizationMember } from '@/domain/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Building2, Mail, MapPin, Edit, X, Check, Users } from 'lucide-react';
import { toast } from 'sonner';
import { t } from '@/lib/translations';
import { StaffMember } from '@/domain/entities/staff';

interface OrganizationPageClientProps {
  organization: Organization;
  isAdmin: boolean;
}

export function OrganizationPageClient({ organization, isAdmin }: OrganizationPageClientProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editName, setEditName] = useState(organization.name);
  const [editDescription, setEditDescription] = useState(organization.description || '');
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(true);
  const [isLoadingStaff, setIsLoadingStaff] = useState(false);
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<OrganizationMember | null>(null);
  const [selectedStaffMemberId, setSelectedStaffMemberId] = useState('');
  const [isSavingLink, setIsSavingLink] = useState(false);

  useEffect(() => {
    fetchMembers();
    if (isAdmin) {
      fetchStaffMembers();
    }
  }, [isAdmin]);

  const fetchMembers = async () => {
    try {
      setIsLoadingMembers(true);
      const response = await fetch('/api/organizations/members');
      if (response.ok) {
        const data = await response.json();
        setMembers(data);
      }
    } catch (error) {
      console.error('Error fetching members:', error);
    } finally {
      setIsLoadingMembers(false);
    }
  };

  const fetchStaffMembers = async () => {
    try {
      setIsLoadingStaff(true);
      const response = await fetch('/api/staff?isActive=true&limit=200');
      if (!response.ok) {
        throw new Error('Errore nel caricamento staff');
      }

      const payload = await response.json();
      setStaffMembers(payload.data || []);
    } catch (error) {
      console.error('Error fetching staff members:', error);
      toast.error('Impossibile caricare lo staff disponibile');
    } finally {
      setIsLoadingStaff(false);
    }
  };

  const openLinkDialog = (member: OrganizationMember) => {
    setSelectedMember(member);
    setSelectedStaffMemberId(member.staffMemberId || '');
    setIsLinkDialogOpen(true);
  };

  const handleLinkStaff = async () => {
    if (!selectedMember) return;

    if (!selectedStaffMemberId) {
      toast.error('Seleziona un membro staff da collegare');
      return;
    }

    try {
      setIsSavingLink(true);
      const response = await fetch(`/api/organizations/members/${selectedMember.id}/staff-link`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ staffMemberId: selectedStaffMemberId }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Errore nel collegamento staff');
      }

      setMembers(prev => prev.map(member => (
        member.id === selectedMember.id ? { ...member, ...data } : member
      )));

      toast.success('Staff collegato con successo');
      setIsLinkDialogOpen(false);
      setSelectedMember(null);
      setSelectedStaffMemberId('');
      await fetchMembers();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Errore nel collegamento staff');
    } finally {
      setIsSavingLink(false);
    }
  };

  const handleUnlinkStaff = async (member: OrganizationMember) => {
    try {
      setIsSavingLink(true);
      const response = await fetch(`/api/organizations/members/${member.id}/staff-link`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Errore nello scollegamento staff');
      }

      setMembers(prev => prev.map(current => (
        current.id === member.id ? { ...current, ...data } : current
      )));

      toast.success('Staff scollegato con successo');
      await fetchMembers();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Errore nello scollegamento staff');
    } finally {
      setIsSavingLink(false);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/organizations/${organization.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: editName,
          description: editDescription,
        }),
      });

      if (!response.ok) {
        throw new Error('Errore nell\'aggiornamento');
      }

      toast.success('Organizzazione aggiornata con successo!');
      setIsEditing(false);
      // Refresh della pagina per aggiornare i dati
      window.location.reload();
    } catch {
      toast.error('Errore nell\'aggiornamento dell\'organizzazione');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('organizations.title')}</h1>
          <p className="text-gray-600 mt-2">
            {t('organizations.description')}
          </p>
        </div>
        {isAdmin && !isEditing && (
          <Button onClick={() => setIsEditing(true)}>
            <Edit className="h-4 w-4 mr-2" />
            Modifica
          </Button>
        )}
      </div>

      {/* Organization Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              {t('organizations.organizationName')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isEditing ? (
              <>
                <div>
                  <Label htmlFor="name">{t('organizations.organizationName')} *</Label>
                  <Input
                    id="name"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="description">{t('organizations.description')}</Label>
                  <Textarea
                    id="description"
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    className="mt-1"
                    rows={3}
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={handleSave}
                    disabled={isLoading}
                    className="flex-1"
                  >
                    <Check className="h-4 w-4 mr-2" />
                    {isLoading ? 'Salvataggio...' : 'Salva'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false);
                      setEditName(organization.name);
                      setEditDescription(organization.description || '');
                    }}
                    disabled={isLoading}
                    className="flex-1"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Annulla
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div>
                  <p className="text-sm text-gray-600">{t('organizations.organizationName')}</p>
                  <p className="text-lg font-semibold text-gray-900">{organization.name}</p>
                </div>

                {organization.description && (
                  <div>
                    <p className="text-sm text-gray-600">{t('organizations.description')}</p>
                    <p className="text-gray-700">{organization.description}</p>
                  </div>
                )}

                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <Badge variant={organization.isActive ? 'default' : 'secondary'}>
                    {organization.isActive ? 'Attivo' : 'Inattivo'}
                  </Badge>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Contact Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              {t('auth.email')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {organization.contactEmail && (
              <div>
                <p className="text-sm text-gray-600">{t('auth.email')}</p>
                <p className="text-gray-900">{organization.contactEmail}</p>
              </div>
            )}

            {organization.contactPhone && (
              <div>
                <p className="text-sm text-gray-600">Telefono</p>
                <p className="text-gray-900">{organization.contactPhone}</p>
              </div>
            )}

            {organization.websiteUrl && (
              <div>
                <p className="text-sm text-gray-600">Sito Web</p>
                <a href={organization.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  {organization.websiteUrl}
                </a>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Address */}
      {(organization.address || organization.city || organization.state || organization.postalCode || organization.country) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Indirizzo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {organization.address && (
              <div>
                <p className="text-sm text-gray-600">Indirizzo</p>
                <p className="text-gray-900">{organization.address}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              {organization.city && (
                <div>
                  <p className="text-sm text-gray-600">Città</p>
                  <p className="text-gray-900">{organization.city}</p>
                </div>
              )}
              {organization.state && (
                <div>
                  <p className="text-sm text-gray-600">Provincia</p>
                  <p className="text-gray-900">{organization.state}</p>
                </div>
              )}
              {organization.postalCode && (
                <div>
                  <p className="text-sm text-gray-600">CAP</p>
                  <p className="text-gray-900">{organization.postalCode}</p>
                </div>
              )}
              {organization.country && (
                <div>
                  <p className="text-sm text-gray-600">Paese</p>
                  <p className="text-gray-900">{organization.country}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Teachers/Members Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Insegnanti e Staff
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingMembers ? (
            <p className="text-gray-500">{t('common.loading')}</p>
          ) : members.length === 0 ? (
            <p className="text-gray-500">Nessun insegnante o staff assegnato</p>
          ) : (
            <div className="space-y-3">
              {members.map(member => (
                <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">
                      {member.firstName && member.lastName ? `${member.firstName} ${member.lastName}` : member.email || member.userId}
                    </p>
                    {member.email && (
                      <p className="text-sm text-gray-600">{member.email}</p>
                    )}
                    <Badge className="mt-2" variant={member.role === 'admin' ? 'default' : member.role === 'teacher' ? 'secondary' : 'outline'}>
                      {member.role === 'admin' ? 'Admin' : member.role === 'teacher' ? 'Insegnante' : 'Staff'}
                    </Badge>
                    <p className="mt-2 text-sm text-gray-600">
                      Collegato a staff: <span className="font-medium">{member.staffMemberId ? 'Sì' : 'No'}</span>
                    </p>
                    {member.staffMemberId && (
                      <p className="text-xs text-gray-500">
                        {member.linkedStaffName || member.staffMemberId}
                        {member.linkedStaffEmail ? ` - ${member.linkedStaffEmail}` : ''}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={member.isActive ? 'default' : 'secondary'}>
                      {member.isActive ? 'Attivo' : 'Inattivo'}
                    </Badge>
                    {isAdmin && (
                      <>
                        <Button size="sm" variant="outline" onClick={() => openLinkDialog(member)}>
                          Collega staff
                        </Button>
                        {member.staffMemberId && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleUnlinkStaff(member)}
                            disabled={isSavingLink}
                          >
                            Scollega
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isLinkDialogOpen} onOpenChange={setIsLinkDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Collega membro a staff</DialogTitle>
            <DialogDescription>
              Seleziona un membro staff attivo della stessa organizzazione.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor="staff-link-select">Membro staff</Label>
            <select
              id="staff-link-select"
              className="w-full border rounded-md px-3 py-2 text-sm"
              value={selectedStaffMemberId}
              onChange={(event) => setSelectedStaffMemberId(event.target.value)}
              disabled={isSavingLink || isLoadingStaff}
            >
              <option value="">Seleziona uno staff</option>
              {staffMembers.map((staff) => (
                <option key={staff.id} value={staff.id}>
                  {staff.firstName} {staff.lastName}
                  {staff.email ? ` - ${staff.email}` : ''}
                </option>
              ))}
            </select>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsLinkDialogOpen(false)}
              disabled={isSavingLink}
            >
              Annulla
            </Button>
            <Button onClick={handleLinkStaff} disabled={isSavingLink || !selectedStaffMemberId}>
              {isSavingLink ? 'Salvataggio...' : 'Salva collegamento'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Metadata */}
      <Card>
        <CardHeader>
          <CardTitle>Informazioni</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">ID Organizzazione</p>
              <p className="text-gray-900 font-mono text-xs">{organization.id}</p>
            </div>
            <div>
              <p className="text-gray-600">Creata</p>
              <p className="text-gray-900">{new Date(organization.createdAt).toLocaleDateString('it-IT')}</p>
            </div>
            <div>
              <p className="text-gray-600">Ultimo aggiornamento</p>
              <p className="text-gray-900">{new Date(organization.updatedAt).toLocaleDateString('it-IT')}</p>
            </div>
            {organization.slug && (
              <div>
                <p className="text-gray-600">Slug</p>
                <p className="text-gray-900 font-mono text-xs">{organization.slug}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
