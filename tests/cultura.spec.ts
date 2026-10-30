import { test, expect } from '@playwright/test';

test('verifica y captura pantalla de Cultura Congregacional CMV', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 960 });
  await page.goto('/cultura');

  // Verificar que el título masivo "¡SIEMPRE SOS BIENVENIDO!" está visible
  await expect(page.locator('text=¡SIEMPRE SOS')).toBeVisible();
  await expect(page.getByRole('heading', { name: /Nuestra Cultura/i })).toBeVisible();

  // Captura del Modal / Página (Hero & Navegación)
  await page.screenshot({
    path: 'C:/Users/ale97/.gemini/antigravity/brain/bdcbcf12-6548-4bdc-9ad9-5196ba00f05d/scratch/modal_hero.png',
  });

  // Scrollear a la sección Nuestra Cultura
  await page.locator('#cultura').scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  await page.screenshot({
    path: 'C:/Users/ale97/.gemini/antigravity/brain/bdcbcf12-6548-4bdc-9ad9-5196ba00f05d/scratch/modal_cultura.png',
  });

  // Scrollear a la sección Misión & Visión
  await page.locator('#vision').scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  await page.screenshot({
    path: 'C:/Users/ale97/.gemini/antigravity/brain/bdcbcf12-6548-4bdc-9ad9-5196ba00f05d/scratch/modal_vision.png',
  });

  // Scrollear a la sección Grupos de Vida & Reuniones con la Cruz
  await page.locator('#reuniones').scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  await page.screenshot({
    path: 'C:/Users/ale97/.gemini/antigravity/brain/bdcbcf12-6548-4bdc-9ad9-5196ba00f05d/scratch/modal_cross_reuniones.png',
  });

  // Scrollear a Series Actuales
  await page.locator('#series').scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  await page.screenshot({
    path: 'C:/Users/ale97/.gemini/antigravity/brain/bdcbcf12-6548-4bdc-9ad9-5196ba00f05d/scratch/modal_series.png',
  });

  // Scrollear a Pipeline y Footer
  await page.locator('#proceso').scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  await page.screenshot({
    path: 'C:/Users/ale97/.gemini/antigravity/brain/bdcbcf12-6548-4bdc-9ad9-5196ba00f05d/scratch/modal_pipeline_footer.png',
  });
});
