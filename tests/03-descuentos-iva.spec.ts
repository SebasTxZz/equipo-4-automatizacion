import { test, expect } from '@playwright/test';
import { TiendaPage, pesos } from '../pages/TiendaPage';

/**
 * BLOQUE DESCUENTOS E IMPUESTOS · US-09 a US-12.
 * Producto: Mochila escolar, $ 65.000 · DESC10 → descuento $ 6.500 · DESC20 → $ 13.000.
 * Los fallos conocidos del producto van marcados con test.fail('CLAVE · descripción').
 */

test.describe('US-09 · Aplicar un código de descuento', () => {
  test('CA1: DESC10 descuenta el 10% del subtotal', async ({ page }) => {
    const tienda = new TiendaPage(page);
    await tienda.abrir();
    await tienda.agregar('Mochila escolar');

    await tienda.aplicarCodigo('DESC10');

    await expect(tienda.total('Descuento')).toHaveText(`− ${pesos(6500)}`);
  });

  // Prueba dirigida por datos: una prueba por variante, así el reporte dice exactamente cuáles fallan.
  const VARIANTES = ['desc10', 'Desc10', ' DESC10 '];
  for (const codigo of VARIANTES) {
    test(`CA3: el código "${codigo}" se reconoce igual que DESC10`, async ({ page }) => {
      // " DESC10 " (con espacios) sí funciona hoy porque la tienda hace trim(); las otras dos fallan por mayúsculas.
      test.fail(codigo.trim() !== 'DESC10', 'TE-89 · el código de descuento distingue mayúsculas de minúsculas');
      const tienda = new TiendaPage(page);
      await tienda.abrir();
      await tienda.agregar('Mochila escolar');

      await tienda.aplicarCodigo(codigo);

      await expect(tienda.total('Descuento')).toHaveText(`− ${pesos(6500)}`);
    });
  }
});

test.describe('US-10 · Recibir aviso si el código no es válido', () => {
  test('CA1: un código inexistente muestra el aviso y el total no cambia', async ({ page }) => {
    const tienda = new TiendaPage(page);
    await tienda.abrir();
    await tienda.agregar('Mochila escolar');

    await tienda.aplicarCodigo('ABC123');

    await expect(page.getByText('Código de descuento no válido.', { exact: true })).toBeVisible();
    await expect(tienda.total('Total')).toHaveText(pesos(77350));
  });

  test('CA2: un código inválido NO borra un descuento válido ya aplicado', async ({ page }) => {
    test.fail(true, 'TE-91 · aplicar un código inválido pone el descuento en 0%');
    const tienda = new TiendaPage(page);
    await tienda.abrir();
    await tienda.agregar('Mochila escolar');
    await tienda.aplicarCodigo('DESC10');
    await expect(tienda.total('Descuento')).toHaveText(`− ${pesos(6500)}`); // precondición: quedó aplicado

    await tienda.aplicarCodigo('ABC123');

    await expect(tienda.total('Descuento')).toHaveText(`− ${pesos(6500)}`);
  });
});

test.describe('US-11 · Ver el IVA correcto', () => {
  test('CA2: con descuento, el IVA se calcula sobre el valor descontado', async ({ page }) => {
    test.fail(true, 'TE-92 · el IVA se calcula sobre el subtotal bruto, no sobre el valor descontado');
    const tienda = new TiendaPage(page);
    await tienda.abrir();
    await tienda.agregar('Mochila escolar');
    await tienda.aplicarCodigo('DESC10');

    // Oráculo: el valor esperado sale del requisito, no de lo que muestra la tienda.
    const descuento = 65000 * 0.1;
    const ivaEsperado = (65000 - descuento) * 0.19;
    await expect(tienda.total('IVA')).toHaveText(pesos(ivaEsperado));
  });
});

test.describe('US-12 · Ver el total a pagar correcto', () => {
  test('CA2: con descuento, el total es subtotal − descuento + IVA (IVA sobre lo descontado)', async ({ page }) => {
    test.fail(true, 'TE-92 · mismo defecto que US-11 CA2 (un solo bug en Jira, dos criterios afectados)');
    const tienda = new TiendaPage(page);
    await tienda.abrir();
    await tienda.agregar('Mochila escolar');
    await tienda.aplicarCodigo('DESC10');

    const neto = 65000 - 65000 * 0.1;
    const totalEsperado = neto + neto * 0.19;
    await expect(tienda.total('Total')).toHaveText(pesos(totalEsperado));
  });
});
