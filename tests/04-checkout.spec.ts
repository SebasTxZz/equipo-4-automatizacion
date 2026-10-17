import { test, expect } from '@playwright/test';
import { TiendaPage } from '../pages/TiendaPage';

/**
 * BLOQUE CHECKOUT · US-13 a US-15.
 * Nota: page.getByLabel('Nombre completo') no encuentra el campo (la etiqueta no está asociada con for/id al input),
 * por eso el Page Object usa  label:text-is("...") + input.
 */

const CORREOS_VALIDOS = [
  'juan@correo.com',
  'ana_gomez@gmail.com',
  'ana.gomez@gmail.com',
  'ana-gomez@gmail.com',
  'ana+tienda@gmail.com',
  'ana@universidad.edu.co',
];
const CORREOS_MAL_FORMADOS = ['ana.gmail.com', 'ana@', '@gmail.com', 'ana gomez@gmail.com', 'ana@@gmail.com', 'ana@gmail'];

// Correos válidos que la tienda rechaza hoy (su regex /^\w+@\w+\.\w+$/ no admite ".", "-", "+" ni dominios compuestos).
const RECHAZADOS_POR_BUG = new Set([
  'ana.gomez@gmail.com',
  'ana-gomez@gmail.com',
  'ana+tienda@gmail.com',
  'ana@universidad.edu.co',
]);

test.describe('US-13 · Ir a pagar desde el carrito', () => {
  test('CA3: con total cero o negativo no se puede ir a pagar', async ({ page }) => {
    test.fail(true, 'TE-93 · la tienda solo valida que el carrito no esté vacío, nunca el valor del total');
    const tienda = new TiendaPage(page);
    await tienda.abrir();
    await tienda.agregar('Mochila escolar');

    await tienda.disminuir('Mochila escolar'); // 1 → 0 (por el defecto de US-06, llega a 0)

    await expect(tienda.botonIrAPagar).toBeDisabled();
  });
});

test.describe('US-14 · Completar mis datos de envío', () => {
  test('CA1: con el formulario vacío hay un error por cada campo obligatorio', async ({ page }) => {
    const tienda = new TiendaPage(page);
    await tienda.abrir();
    await tienda.agregar('Esfero azul');
    await tienda.irAPagar();

    await tienda.confirmar();

    await expect(page.getByText('El nombre es obligatorio.')).toBeVisible();
    await expect(page.getByText('El correo es obligatorio.')).toBeVisible();
    await expect(page.getByText('La dirección es obligatoria.')).toBeVisible();
  });

  test('CA2: un nombre y una dirección de solo espacios se rechazan como vacíos', async ({ page }) => {
    const tienda = new TiendaPage(page);
    await tienda.abrir();
    await tienda.agregar('Esfero azul');
    await tienda.irAPagar();
    await tienda.llenarDatos({ nombre: '   ', correo: 'ana@correo.com', direccion: '   ' });

    await tienda.confirmar();

    await expect(page.getByText('El nombre es obligatorio.')).toBeVisible();
    await expect(page.getByText('La dirección es obligatoria.')).toBeVisible();
    await expect(page.getByText('¡Pedido confirmado!')).toHaveCount(0);
  });
});

test.describe('US-15 · Ingresar un correo electrónico válido', () => {
  for (const correo of CORREOS_VALIDOS) {
    test(`CA1-CA3: el correo válido "${correo}" se acepta`, async ({ page }) => {
      test.fail(RECHAZADOS_POR_BUG.has(correo), 'TE-96 · la validación de correo rechaza puntos, guiones, "+" y dominios compuestos');
      const tienda = new TiendaPage(page);
      await tienda.abrir();
      await tienda.agregar('Esfero azul');
      await tienda.irAPagar();
      await tienda.llenarDatos({ nombre: 'Ana Gómez', correo, direccion: 'Calle 10 # 20-30' });

      await tienda.confirmar();

      await expect(page.getByText('¡Pedido confirmado!')).toBeVisible();
    });
  }

  for (const correo of CORREOS_MAL_FORMADOS) {
    test(`CA4: el correo mal formado "${correo}" se rechaza con mensaje claro`, async ({ page }) => {
      const tienda = new TiendaPage(page);
      await tienda.abrir();
      await tienda.agregar('Esfero azul');
      await tienda.irAPagar();
      await tienda.llenarDatos({ nombre: 'Ana Gómez', correo, direccion: 'Calle 10 # 20-30' });

      await tienda.confirmar();

      await expect(page.getByText('El correo no tiene un formato válido.')).toBeVisible();
      await expect(page.getByText('¡Pedido confirmado!')).toHaveCount(0);
    });
  }
});
