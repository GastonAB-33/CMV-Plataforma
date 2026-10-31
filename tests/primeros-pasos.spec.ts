import { test, expect } from '@playwright/test';

test('Flujo completo de Primeros Pasos, Ficha de Bienvenida y Derivación Pastoral', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });

  await page.addInitScript(() => {
    window.localStorage.setItem('cmv_dev_auth', 'true');
  });

  // 1. Visitar la HomePage
  await page.goto('/');
  await page.waitForTimeout(500);

  // 2. Verificar que en el Topbar existe el botón NUEVO HERMANO
  const topbarButton = page.locator('button', { hasText: 'NUEVO HERMANO' }).first();
  await expect(topbarButton).toBeVisible();

  // 3. Verificar que en el banner NO existe el botón NUEVO HERMANO
  const banner = page.locator('main .relative.w-full.overflow-hidden.rounded-2xl header');
  const bannerButton = banner.locator('button', { hasText: 'NUEVO HERMANO' });
  await expect(bannerButton).toHaveCount(0);

  // 4. Abrir la Ficha de Bienvenida desde el Topbar
  await topbarButton.click();
  await expect(page.locator('text=FICHA DE BIENVENIDA').first()).toBeVisible();
  await expect(page.locator('text=Cristo Manantial de Vida · Queremos conocerte y acompañarte').first()).toBeVisible();
  await expect(page.locator('text=RECEPCION:').first()).toBeVisible();
  await expect(page.locator('text=Plataforma Pastoral CMV')).toHaveCount(0);

  // 5. Verificar campos de la ficha: Fecha de nacimiento, teléfono, célula automática, sin campo fecha manual
  await expect(page.locator('label:has-text("Nombre y apellido")')).toBeVisible();
  await expect(page.locator('label:has-text("Fecha de nacimiento")')).toBeVisible();
  await expect(page.locator('label:has-text("Teléfono")')).toBeVisible();
  await expect(page.locator('text=Célula que lo/la recibe')).toBeVisible();
  await expect(page.locator('text=Detectada por tu usuario')).toBeVisible();
  await expect(page.locator('label:has-text("¿Cómo llegó a la iglesia?")')).toBeVisible();
  await expect(page.locator('text=¿Desea que lo/la contactemos?')).toBeVisible();
  await expect(page.locator('label:has-text("Motivo de oración")')).toBeVisible();
  await expect(page.locator('label:has-text("Observaciones")')).toBeVisible();
  await expect(page.locator('text=Gracias por visitarnos. ¡Esperamos volver a verte!')).toBeVisible();

  // Verificar que el cálculo automático de edad funciona al tipear fecha de nacimiento
  const birthInput = page.locator('input[type="date"]');
  await birthInput.fill('1994-08-10');
  await expect(page.locator('text=Edad: 32 años')).toBeVisible();

  // 6. Cerrar modal y navegar a Primeros Pasos
  await page.locator('button:has-text("Cancelar")').click();
  await page.waitForTimeout(300);

  // 7. Navegar al módulo Primeros Pasos desde el menú lateral
  const primerosPasosNavLink = page.locator('aside nav a', { hasText: 'Primeros Pasos' });
  await expect(primerosPasosNavLink).toBeVisible();
  await primerosPasosNavLink.click();

  await page.waitForURL('**/primeros-pasos');
  await expect(page.locator('h1:has-text("Primeros Pasos")')).toBeVisible();
  await expect(page.locator('text=MODULO DE RECEPCION')).toBeVisible();
  await expect(page.locator('text=Recepción de nuevos creyentes, Fichas de Bienvenida y derivación a líderes.')).toBeVisible();
  await expect(page.locator('button:has-text("NUEVA FICHA DE BIENVENIDA")')).toBeVisible();

  // 8. Verificar que la ficha de prueba de "Arce Ariel" (de la imagen de muestra) está visible en la tabla
  const table = page.locator('table');
  await expect(table.locator('text=Arce Ariel')).toBeVisible();
  await expect(table.locator('text=Saetas')).toBeVisible();
  await expect(table.locator('text=DIEGO SOSA')).toBeVisible();

  // 9. Abrir el detalle de la ficha
  await table.locator('button:has-text("Ver Ficha")').first().click();
  const detailModal = page.locator('.fixed.inset-0');
  await expect(detailModal.locator('text=FICHA DE BIENVENIDA').first()).toBeVisible();
  await expect(detailModal.locator('text=RECEPCION:').first()).toBeVisible();
  await expect(detailModal.locator('text=DIEGO SOSA').first()).toBeVisible();
  await expect(detailModal.locator('text=Plataforma Pastoral CMV')).toHaveCount(0);
  await expect(detailModal.locator('text=Llegó por Jorge Zapata')).toBeVisible();
  await expect(detailModal.getByText('Oren por su familia y trabajo')).toBeVisible();
  await expect(detailModal.getByText('MARANATHA.')).toBeVisible();

  // 10. Abrir el modal de derivación desde el detalle
  await detailModal.locator('button:has-text("Derivar a Líder o Pastor")').click();
  const derivarModal = page.locator('.fixed.inset-0');
  await expect(derivarModal.locator('h3:has-text("Asignar a Líder o Pastor")')).toBeVisible();
  await expect(derivarModal.locator('text=Notificación OneSignal Lista')).toBeVisible();

  // 11. Confirmar la derivación
  await derivarModal.locator('button:has-text("Confirmar Derivación y Notificar")').click();
  await page.waitForTimeout(500);

  // 12. Verificar que ahora figura como Derivado en la tabla
  await expect(table.locator('text=Derivado').first()).toBeVisible();
});
