'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@/infrastructure/db/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { t } from '@/lib/translations';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const supabase = createBrowserClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error(`Accesso non riuscito: ${error.message}`);
        return;
      }

      if (!data.user) {
        toast.error(t('errors.unauthorized'));
        return;
      }

      toast.success(t('auth.login') + ' ' + t('common.success'));
      console.log('Login successful, redirecting to organizations...');
      console.log('User data:', data.user);

      // Small delay to ensure auth state is updated
      setTimeout(() => {
        console.log('Executing redirect to /organizations/select');
        router.push('/organizations/select');
      }, 500);

    } catch (error) {
      console.error('Login error:', error);
      toast.error(t('errors.internalServerError'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdminLogin = async () => {
    // Create a fake session cookie for testing
    document.cookie = `admin-session=${Date.now()}; path=/; max-age=86400`; // 24 hours

    // Set default organization for admin testing
    document.cookie = `current-organization=admin-test-org-1; path=/; max-age=86400`;

    toast.success(t('admin.adminDashboard'));
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Benvenuto su Drama Desk</CardTitle>
          <CardDescription>
            Accedi al tuo sistema di gestione teatrale
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Inserisci la tua email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Inserisci la tua password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Accesso in corso...' : 'Accedi'}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-center space-x-2 mb-3">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              <Badge variant="secondary" className="text-xs">
                Development Mode
              </Badge>
            </div>
            <Button
              type="button"
              variant="outline"
              className="w-full text-sm"
              onClick={handleAdminLogin}
            >
              <Shield className="h-4 w-4 mr-2" />
              Accesso Test Admin
            </Button>
            <p className="text-xs text-gray-500 text-center mt-2">
              Solo per scopi di test.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}