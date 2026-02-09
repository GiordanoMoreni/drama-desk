'use client';

import { useEffect } from 'react';

interface SetCurrentOrganizationProps {
  organizationId: string;
}

export function SetCurrentOrganization({ organizationId }: SetCurrentOrganizationProps) {
  useEffect(() => {
    const setOrganization = async () => {
      try {
        await fetch('/api/organization/set-current', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ organizationId }),
        });
      } catch (error) {
        console.error('Failed to set current organization:', error);
      }
    };

    setOrganization();
  }, [organizationId]);

  return null;
}
