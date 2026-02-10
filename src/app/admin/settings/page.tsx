export const dynamic = 'force-dynamic';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Settings, Mail, Globe, Building2, AlertCircle } from 'lucide-react';
import { requireAuth } from '@/lib/auth';

async function getSystemSettings() {
  try {
    await requireAuth();
    
    // For now, return default settings
    // This can be extended to fetch from a system_settings table
    return {
      appName: 'Drama Desk',
      adminEmail: 'admin@dramadesk.com',
      siteUrl: 'https://dramadesk.app',
      appDescription: 'Platform for managing theatrical organizations',
      maintenanceMode: false,
    };
  } catch (error) {
    console.error('Error fetching system settings:', error);
    return null;
  }
}

export default async function AdminSettingsPage() {
  const settings = await getSystemSettings();

  if (!settings) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <p className="text-red-600">Unable to load system settings</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
        <p className="text-gray-600 mt-2">
          Configure application-wide settings and preferences
        </p>
      </div>

      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            General Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="appName">Application Name</Label>
            <Input
              id="appName"
              defaultValue={settings.appName}
              disabled
              className="bg-gray-50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="siteUrl">Site URL</Label>
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-gray-400" />
              <Input
                id="siteUrl"
                type="url"
                defaultValue={settings.siteUrl}
                disabled
                className="bg-gray-50"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Application Description</Label>
            <Textarea
              id="description"
              defaultValue={settings.appDescription}
              disabled
              className="bg-gray-50 min-h-[100px]"
            />
          </div>
        </CardContent>
      </Card>

      {/* Contact & Communication */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Contact & Communication
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="adminEmail">Admin Email Address</Label>
            <Input
              id="adminEmail"
              type="email"
              defaultValue={settings.adminEmail}
              disabled
              className="bg-gray-50"
            />
          </div>

          <div className="text-sm text-gray-600 bg-blue-50 p-4 rounded border border-blue-200">
            <p className="font-medium text-blue-900 mb-2">Email Configuration</p>
            <ul className="list-disc list-inside space-y-1 text-blue-800">
              <li>SMTP settings configured via environment variables</li>
              <li>Email invitations sent to organization members</li>
              <li>Password reset emails via Supabase Auth</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            System Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded">
              <p className="text-sm text-gray-600">Environment</p>
              <p className="text-lg font-semibold text-gray-900">
                {process.env.NODE_ENV}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded">
              <p className="text-sm text-gray-600">Maintenance Mode</p>
              <p className="text-lg font-semibold text-gray-900">
                {settings.maintenanceMode ? 'ON' : 'OFF'}
              </p>
            </div>
          </div>

          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> System settings are read-only in this interface. 
              Configuration changes require environment variable updates or database modifications.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Maintenance Mode Notice */}
      {!settings.maintenanceMode && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <p className="text-sm text-green-800">
              ✓ System is running normally. All services are operational.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
