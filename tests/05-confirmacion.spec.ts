import { test, expect } from '@playwright/test';
import { TiendaPage } from '../pages/TiendaPage';
import { BUG } from './bugs';

/**
 * BLOQUE CONFIRMACIÓN · US-16 a US-19.
 * Cada prueba arranca con el navegador limpio (carrito vacío, sin memoria de la anterior).
 * La compra completa vive en tienda.comprar(): se escribe una sola vez, en el Page Object.
 */

test.describe('US-16 · Que mis datos no queden a la vista de otra persona', () => {
  test('CA1: tras confirmar y empezar otra compra, el formulario aparece vacío', async ({ page }) => {
    test.fail(true, `${BUG.FORMULARIO_CONSERVA_DATOS} · el formulario conserva los datos de la compra anterior`);
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
  test('CA1: con datos válidos veo "¡Pedido confirmado!" y un número de pedido', async ({ page }) => {
    const tienda = new TiendaPage(page);
    await tienda.abrir();

    await tienda.comprar('Esfero azul');

    await expect(tienda.pedidoConfirmado).toBeVisible();
    await expect(page.getByText(/Número de pedido:/)).toHaveText(/#\d+/);
  });

  test('CA2: un segundo pedido (sin recargar) tiene otro número', async ({ page }) => {
    const tienda = new TiendaPage(page);
    await tienda.abrir();
    await tienda.comprar('Esfero azul');
    const primero = await tienda.numeroDePedido();

    await tienda.volverALaTienda();
    await tienda.comprar('Cuaderno universitario');
    const segundo = await tienda.numeroDePedido();

    expect(segundo).not.toBe(primero);
  });

  test('CA3: un pedido hecho después de recargar la página no repite un número anterior', async ({ page }) => {
    test.fail(true, `${BUG.PEDIDO_REPETIDO_TRAS_RECARGAR} · el número de pedido se repite tras recargar`);
    // Predicción antes de ejecutar: FALLA. Si el contador de pedidos vive solo en memoria de la página, al recargar
    // vuelve a empezar y el segundo pedido repite el número del primero.
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
  test('CA1: tras confirmar, el carrito está vacío y el contador marca 0', async ({ page }) => {
    const tienda = new TiendaPage(page);
    await tienda.abrir();
    await tienda.comprar('Esfero azul');

    await tienda.volverALaTienda();

    await expect(tienda.carritoVacio).toBeVisible();
    await expect(tienda.contador).toContainText('0 artículo(s)');
  });
});
