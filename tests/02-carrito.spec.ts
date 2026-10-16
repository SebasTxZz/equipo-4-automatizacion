import { test, expect } from '@playwright/test';
import { TiendaPage } from '../pages/TiendaPage';
import { BUG } from './bugs';

/**
 * BLOQUE CARRITO · US-04 a US-07.
 * Las pruebas usan el Page Object (pages/TiendaPage.ts): cuentan la historia y no el HTML.
 * El ejemplo guiado (US-04 · CA1) se conserva con localizadores directos, como punto de comparación.
 */

test.describe('US-04 · Agregar productos sin superar el stock', () => {
  // ─────────────── EJEMPLO GUIADO (resuelto, sin Page Object) ───────────────
  test('CA1: se pueden agregar 15 cuadernos (stock 15)', async ({ page }) => {
    // ARRANGE: abrir la tienda
    await page.goto('/');

    // ACT: ubicar la tarjeta del cuaderno, escribir 15 en su cantidad y presionar "Agregar"
    const tarjeta = page
      .locator('.rounded-lg')
      .filter({ has: page.getByRole('heading', { name: 'Cuaderno universitario', level: 3 }) });
    await tarjeta.getByRole('spinbutton').fill('15');
    await tarjeta.getByRole('button', { name: 'Agregar' }).click();

    // ASSERT: en el carrito aparece el cuaderno con cantidad 15
    const carrito = page
      .locator('.rounded-lg')
      .filter({ has: page.getByRole('heading', { name: 'Carrito' }) });
    const linea = carrito.getByRole('listitem').filter({ hasText: 'Cuaderno universitario' });
    await expect(linea.locator('span')).toHaveText('15');
  });

  test('CA2: no deja agregar 7 mochilas de una vez (stock 6) y avisa', async ({ page }) => {
    // ARRANGE: la tienda avisa con un alert() que bloquea la página: el manejador se registra ANTES del clic.
    const tienda = new TiendaPage(page);
    let aviso = '';
    page.once('dialog', async (dialogo) => {
      aviso = dialogo.message();
      await dialogo.accept();
    });
    await tienda.abrir();

    // ACT: intentar agregar 7 mochilas
    await tienda.agregar('Mochila escolar', 7);

    // ASSERT: el aviso menciona el stock y el carrito sigue vacío
    await expect.poll(() => aviso).toContain('Solo hay 6 unidades');
    await expect(tienda.carritoVacio).toBeVisible();
  });

  test('CA3: 4 + 4 mochilas supera el stock (6) y debe rechazarse', async ({ page }) => {
    test.fail(true, `${BUG.STOCK_ACUMULADO} · 4 + 4 mochilas supera el stock (6): el carrito queda en 8`);
    // El criterio exige que el stock no se supere: la cantidad en el carrito se queda en 4.
    // Si la tienda avisa con un alert(), se acepta para que no bloquee la página.
    page.on('dialog', (dialogo) => dialogo.accept());
    const tienda = new TiendaPage(page);
    await tienda.abrir();

    await tienda.agregar('Mochila escolar', 4);
    await tienda.agregar('Mochila escolar', 4);

    await expect(tienda.cantidad('Mochila escolar')).toHaveText('4');
  });
});

test.describe('US-05 · Aumentar la cantidad desde el carrito', () => {
  test('CA2: "+" no pasa del stock (6 mochilas)', async ({ page }) => {
    test.fail(true, `${BUG.MAS_SUPERA_STOCK} · "+" sigue subiendo la cantidad aunque se alcance el stock`);
    page.on('dialog', (dialogo) => dialogo.accept());
    const tienda = new TiendaPage(page);
    await tienda.abrir();
    await tienda.agregar('Mochila escolar', 6);

    await tienda.aumentar('Mochila escolar');

    await expect(tienda.cantidad('Mochila escolar')).toHaveText('6');
  });
});

test.describe('US-06 · Disminuir la cantidad desde el carrito', () => {
  // El criterio acepta dos salidas correctas (quedarse en 1 o eliminar el producto): se elige "quedarse en 1".
  test('CA2: con cantidad 1, "−" no la deja en 0 ni en negativo (se queda en 1)', async ({ page }) => {
    test.fail(true, `${BUG.MENOS_BAJA_DE_UNO} · "−" permite llegar a 0 y a cantidades negativas`);
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
    await tienda.agregar('Esfero azul');

    await tienda.eliminar('Esfero azul');

    await expect(tienda.carritoVacio).toBeVisible();
    await expect(tienda.total('Total')).toHaveText('$ 0');
  });
});
