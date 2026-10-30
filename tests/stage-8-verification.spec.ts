import { test, expect } from '@playwright/test';

test('verifica botones y paneles emergentes de la Etapa 8: Líder de Célula con Grupos de Vida y Nivelados sin eliminar', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1200 });

  await page.addInitScript(() => {
    window.localStorage.setItem('cmv_dev_auth', 'true');
  });

  // 1. Navegar a la ficha de Luis Rodriguez
  await page.goto('/hermanos/4');
  await expect(page.locator('h1, h2, h3').filter({ hasText: /Luis Rodriguez/i }).first()).toBeVisible({ timeout: 10000 });

  // 2. Abrir el Simulador y saltar a Etapa 8
  const simBtn = page.locator('button').filter({ hasText: /SIMULADOR/i }).first();
  await expect(simBtn).toBeVisible();
  await simBtn.click();
  await page.waitForTimeout(400);

  // Clic en E8 para habilitar Etapa 8
  const e8Btn = page.locator('button').filter({ hasText: 'E8' }).first();
  await expect(e8Btn).toBeVisible();
  await e8Btn.click();
  await page.waitForTimeout(400);

  // Clic en + Conector para tener un discípulo conector de prueba en la célula
  const addConectorBtn = page.locator('button').filter({ hasText: '+ Conector' }).first();
  if (await addConectorBtn.isVisible()) {
    await addConectorBtn.click();
    await page.waitForTimeout(400);
  }

  // Cerrar el modal del simulador con su botón de cerrar panel
  const closeSimBtn = page.locator('button[title="Cerrar panel"]').first();
  if (await closeSimBtn.isVisible()) {
    await closeSimBtn.click();
  }
  await page.waitForTimeout(400);

  // 3. Ubicar botones de Etapa 8 en la ficha usando textos unicos
  const btnConectores = page.locator('text=Ver Conectores').first();
  await btnConectores.scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  await expect(btnConectores).toBeVisible();

  const btnGruposVida = page.locator('text=Ver Grupos').first();
  await expect(btnGruposVida).toBeVisible();

  const btnNivelados = page.locator('text=Ver Nivelados').first();
  await expect(btnNivelados).toBeVisible();

  // Capturar vista general de los 3 botones en la Etapa 8
  await page.screenshot({
    path: 'C:/Users/ale97/.gemini/antigravity/brain/59e5943d-074c-4daa-b6c0-f395af7924a3/scratch/etapa8_three_buttons.png',
  });

  // 4. TEST PANEL EMERGENTE 1: Discípulos Conectores y Altares
  await btnConectores.click();
  await page.waitForTimeout(500);

  // Verificar modal abierto con título
  const conectorModalHeader = page.locator('h2').filter({ hasText: /Discípulos Conectores/i }).first();
  await expect(conectorModalHeader).toBeVisible();

  // Verificar tarjetas de métricas generales del modal
  await expect(page.locator('text=TOTAL CONECTORES').first()).toBeVisible();
  await expect(page.locator('text=ALTARES ABIERTOS').first()).toBeVisible();

  // Si hay botón "Ver Altares", hacer clic para ver la vista de Imagen 2
  const verAltaresBtn = page.locator('button').filter({ hasText: /Ver Altares/i }).first();
  if (await verAltaresBtn.isVisible()) {
    await verAltaresBtn.click();
    await page.waitForTimeout(400);

    // Verificar vista según Imagen 2
    await expect(page.locator('text=Seguimiento de Altares y Discípulos').first()).toBeVisible();
    await expect(page.locator('text=TOTAL ALTARES').first()).toBeVisible();
    await expect(page.locator('text=EN PROCESO').first()).toBeVisible();
    await expect(page.locator('text=FINALIZADOS').first()).toBeVisible();
    await expect(page.locator('text=INTERRUMPIDOS').first()).toBeVisible();

    // Probar volver a la lista de conectores dentro del mismo modal
    const backBtn = page.locator('button').filter({ hasText: /Volver a la lista de conectores/i }).first();
    await expect(backBtn).toBeVisible();
    await backBtn.click();
    await page.waitForTimeout(400);
    await expect(page.locator('text=TOTAL CONECTORES').first()).toBeVisible();
  }

  // Cerrar modal de conectores
  const closeConectoresModal = page.locator('button').filter({ hasText: /^Cerrar$/i }).first();
  await closeConectoresModal.click();
  await page.waitForTimeout(400);

  // 5. TEST PANEL EMERGENTE 2: Grupos de Vida dentro de la Célula
  await btnGruposVida.click();
  await page.waitForTimeout(400);

  // Verificar que abre primero la lista de grupos de vida de la célula
  const gvModalHeader = page.locator('h2').filter({ hasText: /Grupos de Vida/i }).first();
  await expect(gvModalHeader).toBeVisible();
  await expect(page.locator('text=Grupos de Vida en la Célula').first()).toBeVisible();

  // Capturar vista de lista de grupos de vida
  await page.screenshot({
    path: 'C:/Users/ale97/.gemini/antigravity/brain/59e5943d-074c-4daa-b6c0-f395af7924a3/scratch/modal_grupos_vida_lista.png',
  });

  // Clic en "Ver Integrantes" de un grupo de vida dentro del modal para ver sus integrantes (Imagen 1)
  const activeModal = page.locator('.fixed.inset-0');
  const verIntegrantesBtn = activeModal.locator('button').filter({ hasText: /Ver Integrantes/i }).first();
  if (await verIntegrantesBtn.isVisible()) {
    await verIntegrantesBtn.click();
    await page.waitForTimeout(400);

    // Verificar botón para volver a la lista de grupos
    const backToGroupsBtn = activeModal.locator('button').filter({ hasText: /Volver a la lista de grupos/i }).first();
    await expect(backToGroupsBtn).toBeVisible();

    // Verificar ficha de líder del grupo
    await expect(activeModal.locator('text=Líder:').first()).toBeVisible();
    await expect(activeModal.locator('text=Rol:').first()).toBeVisible();

    // Capturar vista de integrantes del grupo (Imagen 1)
    await page.screenshot({
      path: 'C:/Users/ale97/.gemini/antigravity/brain/59e5943d-074c-4daa-b6c0-f395af7924a3/scratch/modal_grupo_vida_integrantes_image1.png',
    });

    // Probar volver a la lista de grupos de vida en el mismo panel emergente
    await backToGroupsBtn.click();
    await page.waitForTimeout(400);
    await expect(activeModal.locator('text=Grupos de Vida en la Célula').first()).toBeVisible();
  }

  // Cerrar modal de Grupos de Vida
  const closeGvModal = activeModal.locator('button').filter({ hasText: /^Cerrar$/i }).first();
  await closeGvModal.click();
  await page.waitForTimeout(400);

  // 6. TEST PANEL EMERGENTE 3: Seguimiento de Nivelados (sin botón de eliminar)
  await btnNivelados.click();
  await page.waitForTimeout(400);

  // Verificar modal abierto con título
  const niveladosModalHeader = page.locator('h2').filter({ hasText: /Seguimiento de Nivelados/i }).first();
  await expect(niveladosModalHeader).toBeVisible();

  // Verificar botón de registrar y badges
  await expect(page.locator('button').filter({ hasText: /REGISTRAR NIVELADOS/i }).first()).toBeVisible();
  await expect(page.locator('text=Total:').first()).toBeVisible();
  await expect(page.locator('text=Asistidos:').first()).toBeVisible();

  // VERIFICAR QUE NO HAYA BOTÓN DE ELIMINAR / PAPELERA (REQUERIMIENTO DEL USUARIO)
  const deleteTrashButtons = page.locator('button[title="Eliminar registro"]');
  await expect(deleteTrashButtons).toHaveCount(0);

  // Probar botón de alternancia ASISTIDO / NO ASISTIDO
  const attendanceBtn = page.locator('button').filter({ hasText: /ASISTIDO/i }).first();
  if (await attendanceBtn.isVisible()) {
    await attendanceBtn.click();
    await page.waitForTimeout(300);
    await attendanceBtn.click();
    await page.waitForTimeout(300);
  }

  // Capturar modal de Seguimiento de Nivelados sin papelera
  await page.screenshot({
    path: 'C:/Users/ale97/.gemini/antigravity/brain/59e5943d-074c-4daa-b6c0-f395af7924a3/scratch/modal_seguimiento_nivelados.png',
  });

  // Cerrar modal de Nivelados
  const closeNiveladosModal = page.locator('button').filter({ hasText: /^Cerrar$/i }).first();
  await closeNiveladosModal.click();
  await page.waitForTimeout(400);
});
