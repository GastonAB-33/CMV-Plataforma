import { test, expect } from '@playwright/test';

test('verifica la Red Apostólica y los logos en las células de vida', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 960 });
  await page.addInitScript(() => {
    window.localStorage.setItem('cmv_dev_auth', 'true');
  });
  await page.goto('/celulas');

  // Verificar título principal
  await expect(page.getByRole('heading', { name: /Hermanos & Células/i })).toBeVisible();

  // Verificar sección destacada de la Red Apostólica
  await expect(page.getByRole('heading', { name: /Red Apostólica/i })).toBeVisible();
  await expect(page.locator('text=No es una célula más')).toBeVisible();
  await expect(page.locator('text=cobertura apostólica de la cual se desprenden todas las células')).toBeVisible();

  // Verificar que existen las células con sus identidades y logos
  await expect(page.locator('text=Células de Vida & Grupos Familiares')).toBeVisible();
  await expect(page.getByRole('heading', { name: /^Vida$/i })).toBeVisible();
  await expect(page.getByRole('heading', { name: /^Saetas$/i })).toBeVisible();
  await expect(page.getByRole('heading', { name: /^Maranatha$/i })).toBeVisible();

  // Verificar que los logos de las células están en el DOM (en la sección apostólica y en cada tarjeta)
  await expect(page.locator('[aria-label="Logo Célula Vida"]').first()).toBeVisible();
  await expect(page.locator('[aria-label="Logo Célula Saetas"]').first()).toBeVisible();
  await expect(page.locator('[aria-label="Logo Célula Maranatha"]').first()).toBeVisible();

  // Tomar captura de pantalla de la página completa
  await page.screenshot({
    path: 'C:/Users/ale97/.gemini/antigravity/brain/05e51130-44b8-4414-a91c-af6eb0ebff96/scratch/celulas_directory.png',
  });

  // Scrollear hacia las tarjetas de células y capturar
  await page.locator('text=Células de Vida & Grupos Familiares').scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  await page.screenshot({
    path: 'C:/Users/ale97/.gemini/antigravity/brain/05e51130-44b8-4414-a91c-af6eb0ebff96/scratch/celulas_cards.png',
  });

  // Scrollear hacia Maranatha y Sion y capturar
  await page.getByRole('heading', { name: /^Maranatha$/i }).scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  await page.screenshot({
    path: 'C:/Users/ale97/.gemini/antigravity/brain/05e51130-44b8-4414-a91c-af6eb0ebff96/scratch/celulas_cards_more.png',
  });

  // Probar Modo Oscuro
  const themeBtn = page.getByRole('button', { name: /oscuro/i });
  if (await themeBtn.isVisible()) {
    await themeBtn.click();
    await page.waitForTimeout(400);
    await page.screenshot({
      path: 'C:/Users/ale97/.gemini/antigravity/brain/05e51130-44b8-4414-a91c-af6eb0ebff96/scratch/celulas_dark.png',
    });
  }
});

test('verifica el panel Bento principal con la paleta esmeralda/turquesa/cian y relieves flotantes', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 960 });
  await page.addInitScript(() => {
    window.localStorage.setItem('cmv_dev_auth', 'true');
  });
  await page.goto('/');

  // Verificar que el botón de células está visible y contiene el título
  await expect(page.getByRole('heading', { name: /CÉLULAS/i })).toBeVisible();

  // Capturar vista del panel principal
  await page.screenshot({
    path: 'C:/Users/ale97/.gemini/antigravity/brain/05e51130-44b8-4414-a91c-af6eb0ebff96/scratch/home_bento_relief.png',
    fullPage: false,
  });
});
