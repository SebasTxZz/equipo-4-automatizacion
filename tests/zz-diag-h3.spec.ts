import { test, expect } from '@playwright/test';

// TEMPORAL: compara variantes de H3 con --repeat-each. Se borra antes de entregar.
// Simula una máquina lenta (CPU 8x más lenta) para dejar en evidencia la carrera con la hidratación de la página.
test.beforeEach(async ({ page, context }) => {
  const cdp = await context.newCDPSession(page);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 8 });
});

const lineaCuaderno = (page: import('@playwright/test').Page) =>
  page.getByRole('listitem').filter({ hasText: 'Cuaderno universitario' });

test('V0 original (domcontentloaded)', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: 'Agregar' }).first().click();
  await expect(lineaCuaderno(page)).toBeVisible();
});

test('V1 con pausa fija 300 ms', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(300);
  await page.getByRole('button', { name: 'Agregar' }).first().click();
  await expect(lineaCuaderno(page)).toBeVisible();
});

test('V2 goto por defecto (load) + encabezado visible', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 3 }).first()).toBeVisible();
  await page.getByRole('button', { name: 'Agregar' }).first().click();
  await expect(lineaCuaderno(page)).toBeVisible();
});

test('V3 goto + networkidle', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await page.getByRole('button', { name: 'Agregar' }).first().click();
  await expect(lineaCuaderno(page)).toBeVisible();
});
