/**
 * Claves de Jira (proyecto TE) de los bugs del producto que detecta la suite.
 * Se centralizan aquí para que cada `test.fail(...)` apunte a su issue y la clave se actualice en un solo lugar.
 */
export const BUG = {
  STOCK_ACUMULADO: 'TE-85', // US-04 CA3: permite superar el stock con un producto ya en el carrito
  MAS_SUPERA_STOCK: 'TE-86', // US-05 CA2: "+" sigue subiendo aunque se alcance el stock
  MENOS_BAJA_DE_UNO: 'TE-87', // US-06 CA2: "−" permite llegar a 0 y a negativos
  CODIGO_SENSIBLE_A_MAYUSCULAS: 'TE-89', // US-09 CA3: el código distingue mayúsculas/minúsculas
  CODIGO_INVALIDO_BORRA_DESCUENTO: 'TE-91', // US-10 CA2: un código inválido borra el descuento válido
  IVA_CON_DESCUENTO: 'TE-92', // US-11 CA2 / US-12 CA2: IVA y total no se recalculan sobre lo descontado
  PAGAR_CON_TOTAL_CERO: 'TE-93', // US-13 CA3: permite ir a pagar con total cero o negativo
  CORREO_VALIDO_RECHAZADO: 'TE-96', // US-15 CA1-CA3: rechaza dominios compuestos y puntos en el nombre
  FORMULARIO_CONSERVA_DATOS: 'TE-97', // US-16 CA1: el formulario conserva los datos de la compra anterior
  PEDIDO_REPETIDO_TRAS_RECARGAR: 'TE-98', // US-17 CA3: el número de pedido se repite tras recargar
  CAMPOS_SIN_ETIQUETA: 'TE-100', // a11y: los campos del envío no tienen etiqueta asociada (getByLabel no los halla)
} as const;
