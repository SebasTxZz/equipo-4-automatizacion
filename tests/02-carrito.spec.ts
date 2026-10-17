import { test, expect } from '@playwright/test';
import { TiendaPage } from '../pages/TiendaPage';

/**
 * BLOQUE CARRITO · US-04 a US-07.
 *
 * Cómo se trabaja este archivo:
 *  - La primera prueba ya está resuelta (EJEMPLO GUIADO).
 *  - Todas las pruebas están implementadas; los fallos conocidos del producto llevan test.fail(...) con su clave de Jira.
 *  - "Nivel" va de 1 (fácil) a 3 (reto). "CAZABUGS" = el criterio probablemente destapa un bug de la tienda.
 *  - Los localizadores de la tienda están en el "Mapa de la tienda" de la guía del laboratorio.
 */

test.describe('US-04 · Agregar productos sin superar el stock', () => {
  // ─────────────── EJEMPLO GUIADO (resuelto) ───────────────
  test('CA1: se pueden agregar 15 cuadernos (stock 15)', async ({ page }) => {
    // ARRANGE: abrir la tienda
    await page.goto('/');

    // ACT: ubicar la tarjeta del cuaderno, escribir 15 en su cantidad y presionar "Agregar"
    const tarjeta = page
      .locator('.rounded-lg')
      .filter({ has: page.getByRole('heading', { name: 'Cuaderno universitario', level: 3 }) });
    await tarjeta.getByRole('spinbutton').fill('15');
    await tarjeta.getByRole('button', { name: 'Agregar' }).click();

    // ASSERT: en el carrito (la tarjeta con el encabezado "Carrito") aparece el cuaderno con cantidad 15
    const carrito = page
      .locator('.rounded-lg')
      .filter({ has: page.getByRole('heading', { name: 'Carrito' }) });
    const linea = carrito.getByRole('listitem').filter({ hasText: 'Cuaderno universitario' });
    await expect(linea.locator('span')).toHaveText('15');
  });

  // ─────────────── PENDIENTES ───────────────
  test('CA2: no deja agregar 7 mochilas de una vez (stock 6) y avisa', async ({ page }) => {
    const tienda = new TiendaPage(page);
    await tienda.abrir();

    let aviso = '';
    page.once('dialog', async (dialogo) => {
      aviso = dialogo.message();
      await dialogo.accept();
    });
    await tienda.agregar('Mochila escolar', 7);

    expect(aviso).toContain('Solo hay 6 unidades');
    await expect(page.getByText('Tu carrito está vacío.')).toBeVisible();
  });

  test('CA3: 4 + 4 mochilas supera el stock (6) y debe rechazarse', async ({ page }) => {
    test.fail(true, 'TE-85 · agregar 4 + 4 supera el stock: solo se valida la cantidad nueva, no la acumulada');
    const tienda = new TiendaPage(page);
    await tienda.abrir();
    page.on('dialog', (dialogo) => dialogo.accept());

    await tienda.agregar('Mochila escolar', 4);
    await tienda.agregar('Mochila escolar', 4);

    // El criterio exige que el stock no se supere: la cantidad en el carrito se queda en 4.
    await expect(tienda.cantidad('Mochila escolar')).toHaveText('4');
  });
});

test.describe('US-05 · Aumentar la cantidad desde el carrito', () => {
  test('CA2: "+" no pasa del stock (6 mochilas)', async ({ page }) => {
    test.fail(true, 'TE-86 · el botón "+" del carrito no compara contra el stock');
    const tienda = new TiendaPage(page);
    await tienda.abrir();
    await tienda.agregar('Mochila escolar', 6);

    await tienda.aumentar('Mochila escolar');

    await expect(tienda.cantidad('Mochila escolar')).toHaveText('6');
  });
});

test.describe('US-06 · Disminuir la cantidad desde el carrito', () => {
  test('CA2: con cantidad 1, "−" no la deja en 0 ni en negativo (elegimos: se queda en 1)', async ({ page }) => {
    test.fail(true, 'TE-87 · el botón "−" no tiene piso: la cantidad llega a 0 y a negativos');
    const tienda = new TiendaPage(page);
    await tienda.abrir();
    await tienda.agregar('Mochila escolar', 1);

    await tienda.disminuir('Mochila escolar');

    await expect(tienda.cantidad('Mochila escolar')).toHaveText('1');
  });
});

test.describe('US-07 · Quitar un producto del carrito', () => {
  test('CA2: quitar el único producto deja el carrito vacío y el total en $ 0', async ({ page }) => {
    const tienda = new TiendaPage(page);
    await tienda.abrir();
    await tienda.agregar('Esfero azul', 1);

    await tienda.eliminar('Esfero azul');

    await expect(page.getByText('Tu carrito está vacío.')).toBeVisible();
    await expect(tienda.total('Total')).toHaveText('$ 0');
  });
});
