export const dynamic = 'force-dynamic';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { UserPlus, Mail, Building2, Check, X } from 'lucide-react';
import { requireAuth } from '@/lib/auth';
import { createAdminClient } from '@/infrastructure/db/supabase/server-client';
import { t } from '@/lib/translations';

interface AdminInvitationRow {
  id: string;
  user_id: string;
  organization_id: string;
  role: 'admin' | 'teacher' | 'staff';
  is_active: boolean;
  invited_at: string;
  joined_at: string | null;
}

interface AdminOrganizationRow {
  id: string;
  name: string;
  slug: string;
}

interface AdminUserProfileRow {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
}

async function getInvitations() {
  try {
    await requireAuth();
    
    const supabase = await createAdminClient();

    const { data: invitations, error } = await supabase
      .from('organization_members')
      .select('id, user_id, organization_id, role, is_active, invited_at, joined_at')
      .is('joined_at', null)
      .order('invited_at', { ascending: false });

    if (error) {
      console.error('Error fetching invitations:', error);
      return [];
    }

    const typedInvitations = (invitations || []) as AdminInvitationRow[];
    if (typedInvitations.length === 0) return [];

    const organizationIds = Array.from(new Set(typedInvitations.map((invitation) => invitation.organization_id)));
    const userIds = Array.from(new Set(typedInvitations.map((invitation) => invitation.user_id)));

    const [{ data: organizations }, { data: profiles }] = await Promise.all([
      supabase
        .from('organizations')
        .select('id, name, slug')
        .in('id', organizationIds),
      supabase
        .from('user_profiles')
        .select('id, first_name, last_name, email')
        .in('id', userIds),
    ]);

    const orgMap = new Map(
      ((organizations || []) as AdminOrganizationRow[]).map((org) => [org.id, org])
    );
    const profileMap = new Map(
      ((profiles || []) as AdminUserProfileRow[]).map((profile) => [profile.id, profile])
    );

    return typedInvitations.map((invitation) => ({
      ...invitation,
      organizations: orgMap.get(invitation.organization_id) || null,
      user_profiles: profileMap.get(invitation.user_id) || null,
    }));
  } catch (error) {
    console.error('Error fetching invitations:', {
      message: error instanceof Error ? error.message : String(error),
    });
    return [];
  }
}

export default async function AdminInvitationsPage() {
  const invitations = await getInvitations();

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('admin.invitationsPage.title')}</h1>
          <p className="text-gray-600 mt-2">
            {t('admin.invitationsPage.description')}
          </p>
        </div>
      </div>

      {/* Invitations Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t('admin.invitationsPage.pendingInvitations')} ({invitations.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {invitations.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b bg-gray-50">
                  <tr>
                    <th className="text-left py-3 px-4 font-semibold">{t('students.firstName')}</th>
                    <th className="text-left py-3 px-4 font-semibold">{t('auth.email')}</th>
                    <th className="text-left py-3 px-4 font-semibold">{t('organizations.title')}</th>
                    <th className="text-left py-3 px-4 font-semibold">{t('admin.usersPage.role')}</th>
                    <th className="text-left py-3 px-4 font-semibold">{t('admin.invitationsPage.invited')}</th>
                    <th className="text-center py-3 px-4 font-semibold">{t('admin.invitationsPage.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {invitations.map((invitation: any) => {
                    const profile = invitation.user_profiles || {};
                    const org = invitation.organizations || {};
                    
                    return (
                      <tr key={invitation.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="font-medium text-gray-900">
                            {profile.first_name && profile.last_name
                              ? `${profile.first_name} ${profile.last_name}`
                              : t('admin.invitationsPage.pendingUser')}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2 text-gray-600">
                            <Mail className="h-4 w-4" />
                            {profile.email || invitation.user_id}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-gray-400" />
                            {org.name || t('admin.usersPage.unknown')}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant={invitation.role === 'admin' ? 'default' : 'secondary'}>
                            {invitation.role}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-gray-600 text-xs">
                          {new Date(invitation.invited_at).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex justify-center gap-2">
                            <Button size="sm" variant="outline" className="text-green-600 hover:text-green-700">
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <UserPlus className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">{t('admin.invitationsPage.noPendingInvitations')}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
