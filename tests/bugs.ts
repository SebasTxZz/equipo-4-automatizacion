/**
 * Claves de Jira de los bugs del producto que detecta la suite.
 *
 * Se centralizan aquí para actualizarlas en un solo lugar cuando se conozca la clave real del issue
 * en el proyecto TE de Jira (ej. 'TE-12'). Mientras valga 'TE-??', el bug aún no está enlazado a su issue.
 */
export const BUG = {
  STOCK_ACUMULADO: 'TE-??', // US-04 CA3: 4 + 4 mochilas supera el stock
  MAS_SUPERA_STOCK: 'TE-??', // US-05 CA2: "+" supera el stock
  MENOS_BAJA_DE_UNO: 'TE-??', // US-06 CA2: "−" deja la cantidad en 0 o negativa
  CODIGO_INVALIDO_BORRA_DESCUENTO: 'TE-??', // US-10 CA2
  IVA_CON_DESCUENTO: 'TE-??', // US-11 CA2 / US-12 CA2
  PAGAR_CON_TOTAL_CERO: 'TE-??', // US-13 CA3
  CORREO_VALIDO_RECHAZADO: 'TE-??', // US-15 CA1-CA3
  FORMULARIO_CONSERVA_DATOS: 'TE-??', // US-16 CA1
  PEDIDO_REPETIDO_TRAS_RECARGAR: 'TE-??', // US-17 CA3
} as const;
