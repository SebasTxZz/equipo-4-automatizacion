/** Formatea un número como lo hace la tienda: "$ 65.000" (pesos colombianos, sin decimales). */
export const cop = (n: number): string =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n);
