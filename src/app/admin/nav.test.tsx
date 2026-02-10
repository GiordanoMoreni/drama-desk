import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import AdminNav from './nav';

vi.mock('next/navigation', () => ({
  usePathname: () => '/admin/users',
}));

describe('AdminNav', () => {
  it('renders navigation and highlights the active item', () => {
    render(<AdminNav />);

    const usersLink = screen.getByRole('link', { name: 'Utenti' });
    const dashboardLink = screen.getByRole('link', { name: 'Pannello Amministrazione' });

    expect(usersLink).toBeInTheDocument();
    expect(dashboardLink).toBeInTheDocument();
    expect(usersLink.className).toContain('bg-blue-50');
  });
});

