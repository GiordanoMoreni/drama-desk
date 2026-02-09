export const dynamic = 'force-dynamic';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { UserPlus, Mail, Building2, Calendar, Check, X } from 'lucide-react';
import { requireAuth } from '@/lib/auth';

async function getInvitations() {
  try {
    await requireAuth();
    
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/admin/invitations`, {
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });

    if (!response.ok) throw new Error('Failed to fetch invitations');
    return await response.json();
  } catch (error) {
    console.error('Error fetching invitations:', error);
    return [];
  }
}

export default async function AdminInvitationsPage() {
  const invitations = await getInvitations();

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pending Invitations</h1>
          <p className="text-gray-600 mt-2">
            Manage organization member invitations awaiting acceptance
          </p>
        </div>
      </div>

      {/* Invitations Table */}
      <Card>
        <CardHeader>
          <CardTitle>Pending Invitations ({invitations.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {invitations.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b bg-gray-50">
                  <tr>
                    <th className="text-left py-3 px-4 font-semibold">Name</th>
                    <th className="text-left py-3 px-4 font-semibold">Email</th>
                    <th className="text-left py-3 px-4 font-semibold">Organization</th>
                    <th className="text-left py-3 px-4 font-semibold">Role</th>
                    <th className="text-left py-3 px-4 font-semibold">Invited</th>
                    <th className="text-center py-3 px-4 font-semibold">Actions</th>
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
                              : 'Pending User'}
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
                            {org.name || 'Unknown'}
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
              <p className="text-gray-500">No pending invitations</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
