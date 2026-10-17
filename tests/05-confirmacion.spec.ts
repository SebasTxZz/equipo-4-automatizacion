import { test, expect } from '@playwright/test';
import { TiendaPage } from '../pages/TiendaPage';

/**
 * BLOQUE CONFIRMACIÓN · US-16 a US-19.
 * Datos válidos: nombre "Ana Gómez", correo "ana@correo.com", dirección "Calle 10 # 20-30" (los usa tienda.comprar()).
 */

test.describe('US-16 · Que mis datos no queden a la vista de otra persona', () => {
  test('CA1: tras confirmar y empezar otra compra, el formulario aparece vacío', { tag: ['@US-16', '@caso-TE-67', '@bug', '@bug-TE-97'] }, async ({ page }) => {
    test.fail(true, 'TE-97 · el formulario de envío conserva los datos de la compra anterior');
    const tienda = new TiendaPage(page);
    await tienda.abrir();
    await tienda.comprar('Esfero azul');
    await tienda.volverALaTienda();

    await tienda.agregar('Cuaderno universitario');
    await tienda.irAPagar();

    await expect(tienda.campo('Nombre completo')).toHaveValue('');
    await expect(tienda.campo('Correo electrónico')).toHaveValue('');
    await expect(tienda.campo('Dirección de entrega')).toHaveValue('');
  });
});

test.describe('US-17 · Confirmar mi pedido', () => {
  test('CA1: con datos válidos veo "¡Pedido confirmado!" y un número de pedido', { tag: ['@US-17', '@caso-TE-69'] }, async ({ page }) => {
    const tienda = new TiendaPage(page);
    await tienda.abrir();

    await tienda.comprar('Esfero azul');

    await expect(page.getByText('¡Pedido confirmado!')).toBeVisible();
    await expect(page.getByText(/Número de pedido: #\d+/)).toBeVisible();
  });

  test('CA2: un segundo pedido (sin recargar) tiene otro número', { tag: ['@US-17', '@caso-TE-70'] }, async ({ page }) => {
    const tienda = new TiendaPage(page);
    await tienda.abrir();
    await tienda.comprar('Esfero azul');
    const primero = await tienda.numeroDePedido();
    await tienda.volverALaTienda();

    await tienda.comprar('Cuaderno universitario');
    const segundo = await tienda.numeroDePedido();

    expect(segundo).not.toBe(primero);
  });

  test('CA3: un pedido hecho después de recargar la página no repite un número anterior', { tag: ['@US-17', '@caso-TE-71', '@bug', '@bug-TE-98'] }, async ({ page }) => {
    test.fail(true, 'TE-98 · el contador de pedidos vive en memoria y se reinicia al recargar: el número se repite');
    const tienda = new TiendaPage(page);
    await tienda.abrir();
    await tienda.comprar('Esfero azul');
    const primero = await tienda.numeroDePedido();

    await page.reload();
    await tienda.comprar('Cuaderno universitario');
    const segundo = await tienda.numeroDePedido();

    expect(segundo).not.toBe(primero);
  });
});

test.describe('US-19 · Empezar una compra nueva con el carrito limpio', () => {
  test('CA1: tras confirmar, el carrito está vacío y el contador marca 0', { tag: ['@US-19', '@caso-TE-75'] }, async ({ page }) => {
    const tienda = new TiendaPage(page);
    await tienda.abrir();
    await tienda.comprar('Esfero azul');

    await tienda.volverALaTienda();

    await expect(page.getByText('Tu carrito está vacío.')).toBeVisible();
    await expect(page.getByRole('banner')).toContainText('0 artículo(s)');
  });
});
