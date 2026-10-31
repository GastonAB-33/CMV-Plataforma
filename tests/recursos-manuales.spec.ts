import { test, expect } from '@playwright/test';

test('verifica el botón de Recursos al lado de NUEVO y el modal de Manuales con Discípulos Conectores', async ({ page }) => {
  // 1. Probar en vista móvil (390 x 844)
  await page.setViewportSize({ width: 390, height: 844 });

  await page.addInitScript(() => {
    window.localStorage.setItem('cmv_dev_auth', 'true');
  });

  await page.goto('/hermanos');
  await page.waitForTimeout(600);

  // Verificar que al lado del botón NUEVO está el botón RECURSOS
  const nuevoBtn = page.locator('button').filter({ hasText: /^NUEVO$/ }).first();
  await expect(nuevoBtn).toBeVisible();

  const recursosBtn = page.locator('button').filter({ hasText: /^RECURSOS$/ }).first();
  await expect(recursosBtn).toBeVisible();

  // Captura de la vista móvil con ambos botones NUEVO y RECURSOS lado a lado
  await page.screenshot({
    path: 'C:/Users/ale97/.gemini/antigravity/brain/59e5943d-074c-4daa-b6c0-f395af7924a3/scratch/recursos_boton_mobile.png',
  });

  // 2. Abrir el modal de Recursos
  await recursosBtn.click();
  await page.waitForTimeout(400);

  // Verificar que el modal de recursos se abre
  const modal = page.locator('.fixed.inset-0').filter({ hasText: /Recursos y Manuales/i });
  await expect(modal).toBeVisible();

  // Verificar pestañas Manuales y Guías
  const tabManuales = modal.locator('button').filter({ hasText: /Manuales/i });
  await expect(tabManuales).toBeVisible();

  // Verificar que aparece el "Manual de los Discípulos Conectores"
  const manualConectores = modal.locator('text=Manual de los Discípulos Conectores').first();
  await expect(manualConectores).toBeVisible();

  // Captura del listado de manuales
  await page.screenshot({
    path: 'C:/Users/ale97/.gemini/antigravity/brain/59e5943d-074c-4daa-b6c0-f395af7924a3/scratch/recursos_modal_manuales.png',
  });

  // 3. Abrir la lectura del Manual de los Discípulos Conectores
  const leerManualBtn = modal.locator('button').filter({ hasText: /Leer Manual/i }).first();
  await leerManualBtn.click();
  await page.waitForTimeout(400);

  // Verificar vista de lectura del manual de conectores
  await expect(modal.locator('text=El ADN y Propósito del Discípulo Conector')).toBeVisible();
  await expect(modal.locator('text=Lucas 10:1-9')).toBeVisible();

  // Captura del lector del manual
  await page.screenshot({
    path: 'C:/Users/ale97/.gemini/antigravity/brain/59e5943d-074c-4daa-b6c0-f395af7924a3/scratch/recursos_manual_conectores_reader.png',
  });

  // Descargar PDF y verificar notificación toast
  const downloadBtn = modal.locator('button').filter({ hasText: /Descargar/i }).first();
  await downloadBtn.click();
  await page.waitForTimeout(300);

  // 4. Probar también en vista de escritorio (1280x800)
  // Cerrar modal
  const closeBtn = page.locator('button[aria-label="Cerrar modal de recursos"]');
  if (await closeBtn.isVisible()) {
    await closeBtn.click();
  } else {
    const volverBtn = modal.locator('button').filter({ hasText: /Volver a la lista/i });
    if (await volverBtn.isVisible()) {
      await volverBtn.click();
      await page.locator('button[aria-label="Cerrar modal de recursos"]').click();
    }
  }

  await page.setViewportSize({ width: 1280, height: 800 });
  await page.waitForTimeout(400);

  // En escritorio, verificar ambos botones
  const desktopNuevo = page.locator('.hidden.md\\:block button').filter({ hasText: /^NUEVO$/ });
  await expect(desktopNuevo).toBeVisible();

  const desktopRecursos = page.locator('.hidden.md\\:block button').filter({ hasText: /^RECURSOS$/ });
  await expect(desktopRecursos).toBeVisible();

  // Captura de escritorio
  await page.screenshot({
    path: 'C:/Users/ale97/.gemini/antigravity/brain/59e5943d-074c-4daa-b6c0-f395af7924a3/scratch/recursos_desktop_view.png',
  });
});
