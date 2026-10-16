import { test, expect } from '@playwright/test';
import { BUG } from './bugs';

/**
 * PRUEBAS HEREDADAS (Parte 4).
 *
 * Las dejó otro equipo, y nadie sabe por qué fallan: están en CUARENTENA (test.fixme), que es lo que hacen los
 * equipos reales con pruebas rojas que no entienden, para no frenar a los demás.
 *
 * Su trabajo, una por una:
 *   1. Saquen la prueba de cuarentena (borren su línea test.fixme) y ejecútenla.
 *   2. Diagnostiquen QUÉ falla: ¿el PRODUCTO (bug), la PRUEBA (defecto de la prueba), la INESTABILIDAD o el ENTORNO?
 *      Para detectar inestabilidad ejecútenla muchas veces:  npx playwright test heredados -g H3 --repeat-each=10
 *   3. Dejen cada una en su estado correcto y anoten el veredicto en ENTREGA.md.
 * No las "arreglen" a ciegas: un rojo no siempre es un bug.
 */

// VEREDICTO H1 = DEFECTO DE LA PRUEBA: el dato esperado (6) estaba desactualizado. El criterio US-01 · CA1 dice 8
// productos y la tienda muestra 8 (Expected 6 / Received 8). Se corrige la prueba, no la tienda.
test('H1 · el catálogo tiene 8 productos', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 3 })).toHaveCount(8);
});

// VEREDICTO H2 = BUG DEL PRODUCTO (TE-92): 2 mochilas = $ 130.000; DESC20 descuenta $ 26.000; el IVA correcto es el 19% de
// $ 104.000 = $ 19.760. La tienda muestra $ 24.700 (= 19% de $ 130.000, sin descontar). La prueba afirma lo correcto
// y falla siempre igual, así que queda como fallo esperado enlazado a Jira.
test('H2 · el IVA de 2 mochilas con DESC20 es $ 19.760', async ({ page }) => {
  test.fail(true, `${BUG.IVA_CON_DESCUENTO} · el IVA no se calcula sobre el valor descontado (muestra $ 24.700)`);
  await page.goto('/');
  const tarjeta = page
    .locator('.rounded-lg')
    .filter({ has: page.getByRole('heading', { name: 'Mochila escolar', level: 3 }) });
  await tarjeta.getByRole('spinbutton').fill('2');
  await tarjeta.getByRole('button', { name: 'Agregar' }).click();
  await page.getByPlaceholder('Código de descuento').fill('DESC20');
  await page.getByRole('button', { name: 'Aplicar' }).click();
  await expect(page.locator('dt:text-is("IVA (19%)") + dd')).toHaveText('$ 19.760');
});

test('H3 · agregar un cuaderno justo después de cargar', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: 'Agregar' }).first().click();
  await expect(page.getByRole('listitem').filter({ hasText: 'Cuaderno universitario' })).toBeVisible();
});
