import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building2, Users, Plus, Edit, Trash2 } from 'lucide-react';

// Mock data for organizations
const organizations = [
  {
    id: '1',
    name: 'Springfield Community Theatre',
    slug: 'springfield-theatre',
    description: 'Community theatre serving Springfield area',
    memberCount: 45,
    adminCount: 2,
    createdAt: '2024-01-15',
    status: 'active',
  },
  {
    id: '2',
    name: 'Downtown Players',
    slug: 'downtown-players',
    description: 'Professional theatre company',
    memberCount: 28,
    adminCount: 1,
    createdAt: '2024-02-20',
    status: 'active',
  },
  {
    id: '3',
    name: 'Riverside Theatre',
    slug: 'riverside-theatre',
    description: 'Youth theatre program',
    memberCount: 67,
    adminCount: 3,
    createdAt: '2024-03-10',
    status: 'active',
  },
];

export default function AdminOrganizationsPage() {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Organizations</h1>
          <p className="text-gray-600 mt-2">
            Manage theatre organizations and their settings
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Organization
        </Button>
      </div>

      {/* Organizations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {organizations.map((org) => (
          <Card key={org.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{org.name}</CardTitle>
                    <p className="text-sm text-gray-500">@{org.slug}</p>
                  </div>
                </div>
                <Badge variant={org.status === 'active' ? 'default' : 'secondary'}>
                  {org.status}
                </Badge>
              </div>
              <CardDescription>{org.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <div className="flex items-center space-x-1">
                    <Users className="h-4 w-4 text-gray-400" />
                    <span>{org.memberCount} members</span>
                  </div>
                  <div className="text-gray-500">
                    {org.adminCount} admins
                  </div>
                </div>

                <div className="text-xs text-gray-500">
                  Created: {new Date(org.createdAt).toLocaleDateString()}
                </div>

                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Users className="h-3 w-3 mr-1" />
                    Members
                  </Button>
                  <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State for new organization */}
      <Card className="border-dashed border-2 hover:border-blue-300 transition-colors cursor-pointer">
        <CardContent className="p-8 text-center">
          <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Plus className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Create New Organization</h3>
          <p className="text-gray-600 mb-4">
            Set up a new theatre organization to get started
          </p>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Organization
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}