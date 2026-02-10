import { expect, test } from '@playwright/test';

test('admin test flow can access protected admin page', async ({ page }) => {
  await page.route('**/*', (route) => {
    const url = new URL(route.request().url());
    const isLocalhost = url.hostname === '127.0.0.1' || url.hostname === 'localhost';
    const isAllowedProtocol = url.protocol === 'data:' || url.protocol === 'blob:';

    if (isLocalhost || isAllowedProtocol) {
      return route.continue();
    }

    return route.abort();
  });

  await page.goto('/login');
  await page.getByRole('button', { name: 'Accesso Test Admin' }).click();
  await expect(page).toHaveURL(/\/dashboard/);

  await page.goto('/admin');
  await expect(page.getByRole('heading', { name: 'Pannello Amministrazione' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Utenti' })).toBeVisible();
});

