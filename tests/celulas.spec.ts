import { test, expect } from '@playwright/test';

test('verifica células como paneles desplegables, lista de grupos de vida y modal de hermanos', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 960 });
  await page.addInitScript(() => {
    window.localStorage.setItem('cmv_dev_auth', 'true');
  });
  await page.goto('/celulas');

  // 1. Título principal
  await expect(page.getByRole('heading', { name: /Células y Grupos de Vida/i })).toBeVisible();

  // 1.1 Verificar Célula Red Apostólica con Apóstol José Hernández, Apóstol Gabriela Castro y 15 líderes
  await expect(page.getByText(/Célula principal/i)).toBeVisible();
  await expect(page.getByText('Apóstol José Hernández')).toBeVisible();
  await expect(page.getByText('Apóstol Gabriela Castro')).toBeVisible();
  await expect(page.getByText('15 líderes', { exact: true })).toBeVisible();
  await expect(page.getByText('Hermanos en Cobertura')).not.toBeVisible();
  await expect(page.getByText('Ver Lista General')).not.toBeVisible();

  // Verificar que por defecto los 15 líderes están ocultos dentro de 15 líderes
  const redApostolica = page.locator('#red-apostolica-section');
  await expect(redApostolica.getByText('Emanuel Calivar Chanampa')).not.toBeVisible();

  // Capturar estado inicial colapsado con el botón 15 líderes [VER ▾]
  await page.screenshot({
    path: 'C:/Users/ale97/.gemini/antigravity/brain/05e51130-44b8-4414-a91c-af6eb0ebff96/scratch/celula_red_apostolica_colapsada.png',
  });

  // Al hacer clic en el botón interno [VER ▾], se despliegan los 15 líderes
  const verLideresButton = page.getByRole('button', { name: /15 líderes/i });
  await verLideresButton.click();
  await expect(redApostolica.getByText('Emanuel Calivar Chanampa')).toBeVisible();

  // Capturar estado desplegado con los 15 líderes visibles
  await page.screenshot({
    path: 'C:/Users/ale97/.gemini/antigravity/brain/05e51130-44b8-4414-a91c-af6eb0ebff96/scratch/celula_red_apostolica_lideres_desplegados.png',
  });

  // Verificar modal al hacer clic en Apóstol José Hernández
  await page.getByText('Apóstol José Hernández').first().click();
  const leaderModal = page.getByRole('dialog');
  await expect(leaderModal).toBeVisible();
  await expect(leaderModal.getByRole('heading', { name: /Apóstol José Hernández/i })).toBeVisible();
  await expect(leaderModal.getByText(/Apóstol Principal • Cobertura de Líderes/i)).toBeVisible();
  await leaderModal.getByRole('button', { name: 'Cerrar', exact: true }).click();
  await expect(leaderModal).not.toBeVisible();

  // Verificar modal al hacer clic en Apóstol Gabriela Castro
  await page.getByText('Apóstol Gabriela Castro').first().click();
  await expect(leaderModal).toBeVisible();
  await expect(leaderModal.getByRole('heading', { name: /Apóstol Gabriela Castro/i })).toBeVisible();
  await leaderModal.getByRole('button', { name: 'Cerrar', exact: true }).click();
  await expect(leaderModal).not.toBeVisible();

  // 2. Sección Células bajo cobertura (6)
  const celulasBajoCoberturaHeading = page.getByRole('heading', { name: /Células bajo cobertura/i });
  await expect(celulasBajoCoberturaHeading).toBeVisible();
  await celulasBajoCoberturaHeading.scrollIntoViewIfNeeded();
  await page.screenshot({
    path: 'C:/Users/ale97/.gemini/antigravity/brain/05e51130-44b8-4414-a91c-af6eb0ebff96/scratch/celulas_bajo_cobertura_heading.png',
  });

  // Tarjetas de Célula visibles en estado colapsado (como en la Imagen 2)
  const saetasCard = page.locator('#cell-card-saetas');
  await expect(saetasCard).toBeVisible();
  await expect(saetasCard.getByRole('heading', { name: /^Saetas$/i })).toBeVisible();

  // Verificar que en estado colapsado NO se muestran los Grupos de Vida todavía
  await expect(page.getByText('Grupo de Vida Saetas 1 • Familias')).not.toBeVisible();

  // Capturar estado colapsado inicial (idéntico a la Imagen 2)
  await saetasCard.scrollIntoViewIfNeeded();
  await page.screenshot({
    path: 'C:/Users/ale97/.gemini/antigravity/brain/05e51130-44b8-4414-a91c-af6eb0ebff96/scratch/celula_saetas_colapsada.png',
  });

  // 3. Desplegar el panel de la Célula Saetas haciendo clic sobre la tarjeta
  await saetasCard.click();

  // 4. Verificar que se despliega la lista de Grupos de Vida (Imagen 3)
  await expect(page.getByText('Grupo de Vida Saetas 1 • Familias')).toBeVisible();
  await expect(page.getByText('Grupo de Vida Saetas 2 • Jóvenes & Multiplicación')).toBeVisible();

  // Verificar que indica la cantidad de miembros de cada grupo de vida
  await expect(page.getByText('7 miembros').first()).toBeVisible();
  await expect(page.getByText('6 miembros').first()).toBeVisible();

  // Tomar captura de pantalla de la célula Saetas desplegada con sus Grupos de Vida
  await page.screenshot({
    path: 'C:/Users/ale97/.gemini/antigravity/brain/05e51130-44b8-4414-a91c-af6eb0ebff96/scratch/celulas_grupos_vida_desplegados.png',
  });

  // 5. Al hacer clic en un Grupo de Vida, se abre el panel emergente (modal) con la lista de hermanos
  const grupo1Item = page.getByText('Grupo de Vida Saetas 1 • Familias');
  await grupo1Item.click();

  // Verificar modal emergente con los hermanos de ese grupo de vida
  const modal = page.getByRole('dialog');
  await expect(modal).toBeVisible();
  await expect(modal.getByRole('heading', { name: /Grupo de Vida Saetas 1 • Familias/i })).toBeVisible();
  await expect(modal.getByText(/Líder a Cargo/i)).toBeVisible();
  await expect(modal.getByText(/Hermanos Integrantes \(7\)/i)).toBeVisible();

  // Tomar captura de pantalla del modal emergente con los hermanos del Grupo de Vida
  await page.screenshot({
    path: 'C:/Users/ale97/.gemini/antigravity/brain/05e51130-44b8-4414-a91c-af6eb0ebff96/scratch/grupo_vida_members_modal.png',
  });

  // Cerrar el modal
  await modal.getByRole('button', { name: 'Cerrar', exact: true }).click();
  await expect(modal).not.toBeVisible();

  // 6. Verificar también la célula Vida
  const vidaCard = page.locator('#cell-card-vida');
  await expect(vidaCard).toBeVisible();
  await vidaCard.click();

  await expect(page.getByText('Grupo de Vida Vida 1 • Hogares de Bendición')).toBeVisible();
  await expect(page.getByText('Grupo de Vida Vida 2 • Familias en Fe')).toBeVisible();
  await expect(page.getByText('10 miembros').first()).toBeVisible();
  await expect(page.getByText('8 miembros').first()).toBeVisible();
});

test('verifica el panel Bento principal con la paleta esmeralda/turquesa/cian y relieves flotantes', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 960 });
  await page.addInitScript(() => {
    window.localStorage.setItem('cmv_dev_auth', 'true');
  });
  await page.goto('/');

  const celulasHeading = page.getByRole('heading', { name: /^CÉLULAS$/i });
  await expect(celulasHeading).toBeVisible();
  await expect(page.getByText('CÉLULA DE DISCIPULADO')).toBeVisible();
  await expect(page.getByTitle('Células de la Red CMV')).toBeVisible();
  await celulasHeading.scrollIntoViewIfNeeded();

  // Capturar vista del panel Bento con CÉLULAS en tamaño grande y desplazado a la derecha
  await page.screenshot({
    path: 'C:/Users/ale97/.gemini/antigravity/brain/05e51130-44b8-4414-a91c-af6eb0ebff96/scratch/bento_card_celulas_actualizada.png',
  });
});
