import { expect, test } from '@playwright/test';

test('abre la plataforma local en Chrome invitado', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/CMV|Plataforma|Vite/i);
  await expect(page.locator('body')).toBeVisible();
});
