import { test, expect } from '@playwright/test';
import { TiendaPage, DATOS_VALIDOS } from '../pages/TiendaPage';

/**
 * BLOQUE CHECKOUT · US-13 a US-15.
 *
 * Hallazgo: en el formulario de envío page.getByLabel('Nombre completo') NO encuentra el campo porque la etiqueta
 * (<label>) no está asociada al <input> (le falta el atributo `for`/`id`, o el input no está dentro del label).
 * Es un problema de accesibilidad del producto: un lector de pantalla no anuncia a qué campo corresponde cada etiqueta.
 * Por eso el Page Object ubica el campo con  label:text-is("…") + input  (la etiqueta va justo antes del campo).
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

test.describe('US-13 · Ir a pagar desde el carrito', () => {
  test('CA3: con total cero o negativo no se puede ir a pagar', async ({ page }) => {
    const tienda = new TiendaPage(page);
    await tienda.abrir();
    await tienda.agregar('Mochila escolar');
    await tienda.disminuir('Mochila escolar'); // lleva la cantidad a 0 (o la deja donde la tienda la deje)

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
    await tienda.llenarDatos({ nombre: '   ', correo: DATOS_VALIDOS.correo, direccion: '   ' });

    await tienda.confirmar();

    await expect(page.getByText('El nombre es obligatorio.')).toBeVisible();
    await expect(page.getByText('La dirección es obligatoria.')).toBeVisible();
    await expect(tienda.pedidoConfirmado).toBeHidden();
  });
});

test.describe('US-15 · Ingresar un correo electrónico válido', () => {
  // Una prueba por correo: el reporte dice exactamente qué filas fallan. `bug` con clave = fallo esperado de esa fila.
  const FILAS_VALIDAS = CORREOS_VALIDOS.map((correo) => ({ correo, bug: '' }));
  for (const { correo, bug } of FILAS_VALIDAS) {
    test(`CA1-CA3: el correo válido "${correo}" se acepta`, async ({ page }) => {
      test.fail(bug !== '', `${bug} · el correo válido "${correo}" se rechaza`);
      const tienda = new TiendaPage(page);
      await tienda.abrir();
      await tienda.agregar('Esfero azul');
      await tienda.irAPagar();
      await tienda.llenarDatos({ ...DATOS_VALIDOS, correo });

      await tienda.confirmar();

      await expect(tienda.pedidoConfirmado).toBeVisible();
    });
  }

  for (const correo of CORREOS_MAL_FORMADOS) {
    test(`CA4: el correo mal formado "${correo}" se rechaza con un mensaje claro`, async ({ page }) => {
      const tienda = new TiendaPage(page);
      await tienda.abrir();
      await tienda.agregar('Esfero azul');
      await tienda.irAPagar();
      await tienda.llenarDatos({ ...DATOS_VALIDOS, correo });

      await tienda.confirmar();

      await expect(page.getByText('El correo no tiene un formato válido.')).toBeVisible();
      await expect(tienda.pedidoConfirmado).toBeHidden();
    });
  }
});
