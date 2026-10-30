import { test, expect } from '@playwright/test';

test('verifica las 10 etapas y el simulador en la ficha personal del hermano', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1200 });

  await page.addInitScript(() => {
    window.localStorage.setItem('cmv_dev_auth', 'true');
  });

  // Navegar a la ficha de Luis Rodriguez (id: '4')
  await page.goto('/hermanos/4');

  // Esperar a que la ficha cargue
  await expect(page.locator('h1, h2, h3').filter({ hasText: /Luis Rodriguez/i }).first()).toBeVisible({ timeout: 10000 });

  // Abrir Simulador de Etapas
  const simBtn = page.locator('button').filter({ hasText: /SIMULADOR/i }).first();
  await expect(simBtn).toBeVisible();
  await simBtn.click();
  await page.waitForTimeout(500);

  // Verificar botones en el simulador
  await expect(page.locator('button').filter({ hasText: 'E5' })).toBeVisible();
  await expect(page.locator('button').filter({ hasText: 'E7' })).toBeVisible();
  await expect(page.locator('button').filter({ hasText: 'Notas EDDI 2' })).toBeVisible();
  await expect(page.locator('button').filter({ hasText: 'Notas EDDI 3' })).toBeVisible();

  // Guardar captura del simulador con los 10 botones de etapa
  await page.screenshot({
    path: 'C:/Users/ale97/.gemini/antigravity/brain/59e5943d-074c-4daa-b6c0-f395af7924a3/scratch/simulator_10_stages.png',
  });

  // Cargar notas de EDDI 2 y EDDI 3
  await page.locator('button').filter({ hasText: 'Notas EDDI 2' }).click();
  await page.waitForTimeout(300);
  await page.locator('button').filter({ hasText: 'Notas EDDI 3' }).click();
  await page.waitForTimeout(300);

  // Saltar a Etapa 7 (EDDI 3)
  await page.locator('button').filter({ hasText: 'E7' }).click();
  await page.waitForTimeout(400);

  // Minimizar o cerrar el modal del simulador haciendo clic en el icono X
  const closeBtn = page.locator('.lucide-x').first();
  if (await closeBtn.isVisible()) {
    await closeBtn.click();
  }
  await page.waitForTimeout(400);

  // Scrollear a EDDI 2 y capturar con notas cargadas
  const eddi2Title = page.locator('h3, div').filter({ hasText: /^EDDI 2$/i }).first();
  await eddi2Title.scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  await page.screenshot({
    path: 'C:/Users/ale97/.gemini/antigravity/brain/59e5943d-074c-4daa-b6c0-f395af7924a3/scratch/eddi2_with_grades.png',
  });

  // Scrollear a EDDI 3 y capturar con notas cargadas
  const eddi3Title = page.locator('h3, div').filter({ hasText: /^EDDI 3$/i }).first();
  await eddi3Title.scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  await page.screenshot({
    path: 'C:/Users/ale97/.gemini/antigravity/brain/59e5943d-074c-4daa-b6c0-f395af7924a3/scratch/eddi3_with_grades.png',
  });
});
