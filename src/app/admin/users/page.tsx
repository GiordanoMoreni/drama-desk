export const dynamic = 'force-dynamic';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Mail, Building2, Calendar } from 'lucide-react';
import { requireAuth } from '@/lib/auth';

async function getUsers() {
  try {
    await requireAuth();
    
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/admin/users`, {
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });

    if (!response.ok) throw new Error('Failed to fetch users');
    return await response.json();
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
}

export default async function AdminUsersPage() {
  const members = await getUsers();

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Users & Members</h1>
          <p className="text-gray-600 mt-2">
            Manage all organization members and their roles
          </p>
        </div>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Organization Members</CardTitle>
        </CardHeader>
        <CardContent>
          {members.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b bg-gray-50">
                  <tr>
                    <th className="text-left py-3 px-4 font-semibold">Name</th>
                    <th className="text-left py-3 px-4 font-semibold">Email</th>
                    <th className="text-left py-3 px-4 font-semibold">Organization</th>
                    <th className="text-left py-3 px-4 font-semibold">Role</th>
                    <th className="text-left py-3 px-4 font-semibold">Status</th>
                    <th className="text-left py-3 px-4 font-semibold">Joined</th>
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
                            {org.name || 'Unknown'}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant={member.role === 'admin' ? 'default' : 'secondary'}>
                            {member.role}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant={member.is_active ? 'default' : 'secondary'}>
                            {member.is_active ? 'Active' : 'Inactive'}
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
              <p className="text-gray-500">No members found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
