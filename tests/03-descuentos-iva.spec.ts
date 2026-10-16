import { test, expect } from '@playwright/test';
import { TiendaPage } from '../pages/TiendaPage';
import { cop } from './helpers';

/**
 * BLOQUE DESCUENTOS E IMPUESTOS · US-09 a US-12.
 * Valores (producto: Mochila escolar, $ 65.000): DESC10 → descuento $ 6.500 · DESC20 → $ 13.000.
 */

test.describe('US-09 · Aplicar un código de descuento', () => {
  test('CA1: DESC10 descuenta el 10% del subtotal', async ({ page }) => {
    const tienda = new TiendaPage(page);
    await tienda.abrir();
    await tienda.agregar('Mochila escolar');

    await tienda.aplicarCodigo('DESC10');

    await expect(tienda.total('Descuento')).toContainText('6.500');
  });

  // Prueba dirigida por datos: una prueba por variante, así el reporte dice EXACTAMENTE cuáles fallan.
  // `bug` vacío = la variante funciona hoy; con clave de Jira = fallo esperado documentado.
  const VARIANTES: { codigo: string; bug: string }[] = [
    { codigo: 'desc10', bug: '' },
    { codigo: 'Desc10', bug: '' },
    { codigo: ' DESC10 ', bug: '' },
  ];
  for (const { codigo, bug } of VARIANTES) {
    test(`CA3: el código "${codigo}" se reconoce igual que DESC10`, async ({ page }) => {
      test.fail(bug !== '', `${bug} · el código "${codigo}" no se reconoce como DESC10`);
      const tienda = new TiendaPage(page);
      await tienda.abrir();
      await tienda.agregar('Mochila escolar');

      await tienda.aplicarCodigo(codigo);

      await expect(tienda.total('Descuento')).toContainText('6.500');
    });
  }
});

test.describe('US-10 · Recibir aviso si el código no es válido', () => {
  test('CA1: un código inexistente muestra el aviso y el total no cambia', async ({ page }) => {
    const tienda = new TiendaPage(page);
    await tienda.abrir();
    await tienda.agregar('Mochila escolar');

    await tienda.aplicarCodigo('ABC123');

    await expect(tienda.mensajeDescuento).toHaveText('Código de descuento no válido.');
    await expect(tienda.total('Total')).toHaveText('$ 77.350');
  });

  test('CA2: un código inválido NO borra un descuento válido ya aplicado', async ({ page }) => {
    const tienda = new TiendaPage(page);
    await tienda.abrir();
    await tienda.agregar('Mochila escolar');
    await tienda.aplicarCodigo('DESC10');
    await expect(tienda.total('Descuento')).toContainText('6.500'); // quedó aplicado

    await tienda.aplicarCodigo('ABC123');

    await expect(tienda.total('Descuento')).toContainText('6.500');
  });
});

// El ORÁCULO: el valor esperado se calcula en la prueba a partir del requisito, nunca copiando lo que muestra la tienda.
const SUBTOTAL = 65000;
const DESCUENTO = SUBTOTAL * 0.1; // DESC10
const IVA_ESPERADO = (SUBTOTAL - DESCUENTO) * 0.19; // IVA = 19% de (subtotal − descuento)
const TOTAL_ESPERADO = SUBTOTAL - DESCUENTO + IVA_ESPERADO;

test.describe('US-11 · Ver el IVA correcto', () => {
  test('CA2: con descuento, el IVA se calcula sobre el valor descontado', async ({ page }) => {
    const tienda = new TiendaPage(page);
    await tienda.abrir();
    await tienda.agregar('Mochila escolar');
    await tienda.aplicarCodigo('DESC10');

    await expect(tienda.total('IVA')).toHaveText(cop(IVA_ESPERADO));
  });
});

test.describe('US-12 · Ver el total a pagar correcto', () => {
  test('CA2: con descuento, el total es subtotal − descuento + IVA (IVA sobre lo descontado)', async ({ page }) => {
    const tienda = new TiendaPage(page);
    await tienda.abrir();
    await tienda.agregar('Mochila escolar');
    await tienda.aplicarCodigo('DESC10');

    await expect(tienda.total('Total')).toHaveText(cop(TOTAL_ESPERADO));
  });
});
