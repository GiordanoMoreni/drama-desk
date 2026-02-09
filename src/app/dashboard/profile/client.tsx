"use client";

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { t } from '@/lib/translations';

export function ProfileClient() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/profile');
      if (!res.ok) throw new Error('Failed to fetch profile');
      const data = await res.json();
      const profile = data.profile || {};
      setFirstName(profile.first_name || (data.user?.user_metadata?.full_name?.split(' ')[0] || ''));
      setLastName(profile.last_name || (data.user?.user_metadata?.full_name?.split(' ').slice(1).join(' ') || ''));
      setEmail(data.user?.email || profile.email || '');
    } catch (err) {
      console.error('Error fetching profile:', err);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, email, password: password || undefined }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to update profile');

      toast.success('Profilo aggiornato');
      setPassword('');
    } catch (err: any) {
      console.error('Error updating profile:', err);
      toast.error(err?.message || 'Errore aggiornamento profilo');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>{t('profile.title') || 'Il mio profilo'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Nome</Label>
            <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} />
          </div>
          <div>
            <Label>Cognome</Label>
            <Input value={lastName} onChange={(e) => setLastName(e.target.value)} />
          </div>
          <div>
            <Label>Email</Label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <Label>Nuova password</Label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={isLoading}>{isLoading ? 'Salvando...' : 'Salva'}</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
