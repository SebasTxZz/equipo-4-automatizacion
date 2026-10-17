import { type Locator, type Page } from '@playwright/test';

/**
 * PARTE 5 · PAGE OBJECT DE LA TIENDA.
 *
 * Las pruebas cuentan la HISTORIA ("agrego una mochila y aplico DESC10"); los localizadores (el "cómo")
 * viven aquí. Si la tienda cambia su HTML, se corrige esta clase una vez y las pruebas siguen intactas.
 * El Page Object ofrece ACCIONES y entrega LOCALIZADORES; las aserciones (expect) se quedan en las pruebas.
 */
export class TiendaPage {
  /** El panel del carrito (la tarjeta que tiene el encabezado "Carrito"). */
  readonly carrito: Locator;

  constructor(readonly page: Page) {
    this.carrito = page
      .locator('.rounded-lg')
      .filter({ has: page.getByRole('heading', { name: 'Carrito' }) });
  }

  // ---------- Catálogo ----------
  /** Abre la tienda y espera a que el catálogo esté pintado. */
  async abrir(): Promise<void> {
    await this.page.goto('/');
    await this.page.getByRole('heading', { level: 3 }).first().waitFor();
  }

  /** La tarjeta de un producto del catálogo. */
  tarjeta(producto: string): Locator {
    return this.page
      .locator('.rounded-lg')
      .filter({ has: this.page.getByRole('heading', { name: producto, level: 3 }) });
  }

  /** Escribe la cantidad en la tarjeta del producto y presiona "Agregar". */
  async agregar(producto: string, cantidad = 1): Promise<void> {
    const tarjeta = this.tarjeta(producto);
    await tarjeta.getByRole('spinbutton').fill(String(cantidad));
    await tarjeta.getByRole('button', { name: 'Agregar' }).click();
  }

  // ---------- Carrito ----------
  /** La línea del carrito de un producto. */
  linea(producto: string): Locator {
    return this.carrito.getByRole('listitem').filter({ hasText: producto });
  }

  /** El número de unidades que muestra el carrito para un producto. */
  cantidad(producto: string): Locator {
    return this.linea(producto).locator('span');
  }

  /** Presiona "+" de un producto en el carrito. */
  async aumentar(producto: string): Promise<void> {
    await this.page.getByRole('button', { name: `Aumentar cantidad de ${producto}` }).click();
  }

  /** Presiona "−" de un producto en el carrito. */
  async disminuir(producto: string): Promise<void> {
    await this.page.getByRole('button', { name: `Disminuir cantidad de ${producto}` }).click();
  }

  /** Presiona "✕" de un producto en el carrito. */
  async eliminar(producto: string): Promise<void> {
    await this.page.getByRole('button', { name: `Eliminar ${producto}` }).click();
  }

  /** Escribe el código y presiona "Aplicar". */
  async aplicarCodigo(codigo: string): Promise<void> {
    await this.page.getByPlaceholder('Código de descuento').fill(codigo);
    await this.page.getByRole('button', { name: 'Aplicar' }).click();
  }

  /** Valor de una fila del resumen: 'Subtotal', 'Descuento', 'IVA' o 'Total'. */
  total(fila: 'Subtotal' | 'Descuento' | 'IVA' | 'Total'): Locator {
    return this.carrito
      .locator('dt')
      .filter({ hasText: new RegExp(`^${fila}`) })
      .locator('xpath=following-sibling::dd');
  }

  /** El botón "Ir a pagar". */
  get botonIrAPagar(): Locator {
    return this.carrito.getByRole('button', { name: 'Ir a pagar' });
  }

  /** Presiona "Ir a pagar". */
  async irAPagar(): Promise<void> {
    await this.botonIrAPagar.click();
  }

  // ---------- Checkout y confirmación ----------
  /** Un campo del formulario de envío, por el texto de su etiqueta. (getByLabel no funciona aquí.) */
  campo(etiqueta: 'Nombre completo' | 'Correo electrónico' | 'Dirección de entrega'): Locator {
    return this.page.locator(`label:text-is("${etiqueta}") + input`);
  }

  /** Llena el formulario con los datos que reciba. */
  async llenarDatos(datos: { nombre?: string; correo?: string; direccion?: string }): Promise<void> {
    if (datos.nombre !== undefined) await this.campo('Nombre completo').fill(datos.nombre);
    if (datos.correo !== undefined) await this.campo('Correo electrónico').fill(datos.correo);
    if (datos.direccion !== undefined) await this.campo('Dirección de entrega').fill(datos.direccion);
  }

  /** Presiona "Confirmar pedido". */
  async confirmar(): Promise<void> {
    await this.page.getByRole('button', { name: 'Confirmar pedido' }).click();
  }

  /** Lee el número de pedido de la pantalla de confirmación (ej. "1001"). */
  async numeroDePedido(): Promise<string> {
    const texto = await this.page.getByText(/Número de pedido/).innerText();
    return /#(\d+)/.exec(texto)?.[1] ?? '';
  }

  /** Presiona "Volver a la tienda". */
  async volverALaTienda(): Promise<void> {
    await this.page.getByRole('button', { name: 'Volver a la tienda' }).click();
  }

  /** Atajo: compra completa de un producto con datos válidos, hasta ver "¡Pedido confirmado!". */
  async comprar(producto: string, cantidad = 1): Promise<void> {
    await this.agregar(producto, cantidad);
    await this.irAPagar();
    await this.llenarDatos({ nombre: 'Ana Gómez', correo: 'ana@correo.com', direccion: 'Calle 10 # 20-30' });
    await this.confirmar();
  }
}

/** Formatea un número como la tienda: "$ 65.000". */
export function pesos(n: number): string {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n);
}
