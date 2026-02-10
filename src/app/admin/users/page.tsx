export const dynamic = 'force-dynamic';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Mail, Building2 } from 'lucide-react';
import { requireAuth } from '@/lib/auth';
import { createAdminClient } from '@/infrastructure/db/supabase/server-client';
import { t } from '@/lib/translations';

interface AdminMemberRow {
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

async function getUsers() {
  try {
    await requireAuth();
    
    const supabase = await createAdminClient();

    const { data: members, error } = await supabase
      .from('organization_members')
      .select('id, user_id, organization_id, role, is_active, invited_at, joined_at')
      .order('invited_at', { ascending: false });

    if (error) {
      console.error('Error fetching users:', error);
      return [];
    }

    const typedMembers = (members || []) as AdminMemberRow[];
    if (typedMembers.length === 0) return [];

    const organizationIds = Array.from(new Set(typedMembers.map((member) => member.organization_id)));
    const userIds = Array.from(new Set(typedMembers.map((member) => member.user_id)));

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

    return typedMembers.map((member) => ({
      ...member,
      organizations: orgMap.get(member.organization_id) || null,
      user_profiles: profileMap.get(member.user_id) || null,
    }));
  } catch (error) {
    console.error('Error fetching users:', {
      message: error instanceof Error ? error.message : String(error),
    });
    return [];
  }
}

export default async function AdminUsersPage() {
  const members = await getUsers();

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('admin.usersPage.title')}</h1>
          <p className="text-gray-600 mt-2">
            {t('admin.usersPage.description')}
          </p>
        </div>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t('admin.usersPage.organizationMembers')}</CardTitle>
        </CardHeader>
        <CardContent>
          {members.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b bg-gray-50">
                  <tr>
                    <th className="text-left py-3 px-4 font-semibold">{t('students.firstName')}</th>
                    <th className="text-left py-3 px-4 font-semibold">{t('auth.email')}</th>
                    <th className="text-left py-3 px-4 font-semibold">{t('organizations.title')}</th>
                    <th className="text-left py-3 px-4 font-semibold">{t('admin.usersPage.role')}</th>
                    <th className="text-left py-3 px-4 font-semibold">{t('students.status')}</th>
                    <th className="text-left py-3 px-4 font-semibold">{t('admin.usersPage.joined')}</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((member: any) => {
                    const profile = member.user_profiles || {};
                    const org = member.organizations || {};
                    const joined = member.joined_at || member.invited_at;
                    
                    return (
                      <tr key={member.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="font-medium text-gray-900">
                            {profile.first_name} {profile.last_name}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2 text-gray-600">
                            <Mail className="h-4 w-4" />
                            {profile.email || member.user_id}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-gray-400" />
                            {org.name || t('admin.usersPage.unknown')}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant={member.role === 'admin' ? 'default' : 'secondary'}>
                            {member.role}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant={member.is_active ? 'default' : 'secondary'}>
                            {member.is_active ? t('admin.status.active') : t('admin.status.inactive')}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-gray-600 text-xs">
                          {new Date(joined).toLocaleDateString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">{t('admin.usersPage.noMembersFound')}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
