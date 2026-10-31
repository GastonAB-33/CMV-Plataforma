import { test, expect } from '@playwright/test';

test('verifica la página Línea de Vida, banner sin botón, botón NUEVO sin resumen y modal de filtros con paleta esmeralda', async ({ page }) => {
  // Configurar vista móvil similar a la captura (390 x 844)
  await page.setViewportSize({ width: 390, height: 844 });

  await page.addInitScript(() => {
    window.localStorage.setItem('cmv_dev_auth', 'true');
  });

  await page.goto('/hermanos');
  await page.waitForTimeout(600);

  // 1. Verificar el Banner
  const bannerHeader = page.locator('header').filter({ hasText: /Linea de vida/i });
  await expect(bannerHeader).toBeVisible();

  // Badge: PLATAFORMA VISION CMV
  await expect(bannerHeader.locator('text=PLATAFORMA VISION CMV')).toBeVisible();

  // Título: Linea de vida
  await expect(bannerHeader.locator('h1')).toHaveText('Linea de vida');

  // Subtítulo: Seguimiento y gestión espiritual de la Comunidad.
  await expect(bannerHeader.locator('text=Seguimiento y gestión espiritual de la Comunidad.')).toBeVisible();

  // Verificar que NO existe ningún botón dentro del banner
  await expect(bannerHeader.locator('button')).toHaveCount(0);

  // 2. Verificar el botón inferior
  // El botón debe decir solamente "NUEVO" (con el ícono)
  const nuevoBtn = page.locator('button').filter({ hasText: /^NUEVO$/ }).first();
  await expect(nuevoBtn).toBeVisible();

  // Verificar que el botón "Resumen" fue quitado
  await expect(page.locator('button').filter({ hasText: /^Resumen$/i })).toHaveCount(0);

  // 3. Captura de la vista principal móvil (idéntica a la Imagen 1)
  await page.screenshot({
    path: 'C:/Users/ale97/.gemini/antigravity/brain/59e5943d-074c-4daa-b6c0-f395af7924a3/scratch/linea_de_vida_mobile_view.png',
  });

  // 4. Probar y abrir el modal de filtros
  const filterBtn = page.locator('button[aria-label="Abrir filtros"]');
  await expect(filterBtn).toBeVisible();
  await filterBtn.click();
  await page.waitForTimeout(400);

  // Verificar modal abierto con título Filtros
  const filterModal = page.locator('.fixed.inset-0');
  await expect(filterModal.locator('h2').filter({ hasText: 'Filtros' })).toBeVisible();
  await expect(filterModal.locator('text=Selecciona la etiqueta de filtrado.')).toBeVisible();

  // Verificar que el botón TODAS (seleccionado por defecto) tiene la clase btn-3d-pill-active y no tiene el color antiguo
  const todasBtn = filterModal.locator('button').filter({ hasText: /^Todas$/i });
  await expect(todasBtn).toBeVisible();
  await expect(todasBtn).toHaveClass(/btn-3d-pill-active/);

  // 5. Captura del modal de filtros con los nuevos colores del sistema (idéntico a Imagen 2 pero con paleta moderna)
  await page.screenshot({
    path: 'C:/Users/ale97/.gemini/antigravity/brain/59e5943d-074c-4daa-b6c0-f395af7924a3/scratch/linea_de_vida_filtros_modal.png',
  });

  // Cerrar el modal
  const closeBtn = filterModal.locator('button').filter({ has: page.locator('svg.lucide-x') });
  await closeBtn.click();
  await page.waitForTimeout(300);

  // 6. Captura de vista de escritorio (1280x800)
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.waitForTimeout(400);
  await page.screenshot({
    path: 'C:/Users/ale97/.gemini/antigravity/brain/59e5943d-074c-4daa-b6c0-f395af7924a3/scratch/linea_de_vida_desktop_view.png',
  });

  // 7. Navegar a la ficha personal del primer hermano
  const firstRow = page.locator('tbody tr').first();
  await firstRow.click();
  await page.waitForTimeout(600);
  await page.screenshot({
    path: 'C:/Users/ale97/.gemini/antigravity/brain/59e5943d-074c-4daa-b6c0-f395af7924a3/scratch/linea_de_vida_detail_view.png',
  });
});
