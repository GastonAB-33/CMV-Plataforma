import { test, expect } from '@playwright/test';

test('verifica los nombres de los módulos en la barra de navegación lateral', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });

  await page.addInitScript(() => {
    window.localStorage.setItem('cmv_dev_auth', 'true');
  });

  await page.goto('/events');
  await page.waitForTimeout(500);

  const navLinks = page.locator('aside nav a');

  // 1. Visión CMV
  await expect(navLinks.filter({ hasText: 'Visión CMV' })).toBeVisible();

  // 2. Estadísticas (reemplazó a Seguimiento)
  await expect(navLinks.filter({ hasText: 'Estadísticas' })).toBeVisible();

  // 3. Escuelas (unifica EDDI y EDEM)
  await expect(navLinks.filter({ hasText: 'Escuelas' })).toBeVisible();

  // 4. Primeros Pasos
  await expect(navLinks.filter({ hasText: 'Primeros Pasos' })).toBeVisible();

  // 5. Verificar que Congregación no está presente
  await expect(navLinks.filter({ hasText: /^Congregación$/ })).toHaveCount(0);

  // Captura para verificación visual
  await page.screenshot({
    path: 'C:/Users/ale97/.gemini/antigravity/brain/59e5943d-074c-4daa-b6c0-f395af7924a3/scratch/sidebar_restored_verification.png',
  });
});
