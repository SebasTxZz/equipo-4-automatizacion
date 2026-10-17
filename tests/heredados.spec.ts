import { test, expect } from '@playwright/test';
import { TiendaPage } from '../pages/TiendaPage';

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

// H1 · Veredicto: DEFECTO DE LA PRUEBA. El catálogo tiene 8 productos (US-01 CA1 lo exige y la tienda lo cumple);
// la prueba heredada esperaba 6, un dato viejo. Se corrige la expectativa, no la tienda.
test('H1 · el catálogo tiene 8 productos (corregida: antes esperaba 6)', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 3 })).toHaveCount(8);
});

// H2 · Veredicto: BUG DEL PRODUCTO (TE-92). 2 mochilas = $ 130.000; con DESC20 el neto es $ 104.000 y el IVA correcto
// es $ 19.760. La tienda calcula el IVA sobre el subtotal bruto ($ 24.700). La prueba está bien: queda como fallo conocido.
test('H2 · el IVA de 2 mochilas con DESC20 es $ 19.760', async ({ page }) => {
  test.fail(true, 'TE-92 · el IVA se calcula sobre el subtotal bruto, no sobre el valor descontado');
  const tienda = new TiendaPage(page);
  await tienda.abrir();
  await tienda.agregar('Mochila escolar', 2);
  await tienda.aplicarCodigo('DESC20');
  await expect(tienda.total('IVA')).toHaveText('$ 19.760');
});

// H3 · Veredicto: DEFECTO DE SINCRONIZACIÓN DE LA PRUEBA (inestable). Hacía clic con waitUntil:'domcontentloaded',
// sin esperar a que el catálogo estuviera pintado, y asumía que el primer "Agregar" era el del cuaderno.
// Se confirma con:  npx playwright test heredados -g H3 --repeat-each=10  (versión original en el historial de git).
// Corrección: esperar el catálogo (tienda.abrir()) y apuntar a la tarjeta del cuaderno, no a "el primer botón".
test('H3 · agregar un cuaderno justo después de cargar', async ({ page }) => {
  const tienda = new TiendaPage(page);
  await tienda.abrir();
  await tienda.agregar('Cuaderno universitario');
  await expect(tienda.linea('Cuaderno universitario')).toBeVisible();
});
