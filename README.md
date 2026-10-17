# QA Tienda Escolar · Suite de pruebas automatizadas

[![Pruebas automatizadas](https://github.com/SebasTxZz/equipo-4-automatizacion/actions/workflows/playwright.yml/badge.svg)](https://github.com/SebasTxZz/equipo-4-automatizacion/actions/workflows/playwright.yml)

Suite de pruebas end-to-end con **Playwright + TypeScript** para la tienda en línea de prácticas de la materia *Verificación y validación de software* (Laboratorio 3.1 · Universidad Católica Luis Amigó). Convierte los casos de prueba manuales del plan de pruebas en pruebas que se ejecutan solas, detectan bugs del producto y los enlazan con Jira.

| | |
|---|---|
| **Sistema bajo prueba** | https://qa-tienda-pruebas.vercel.app (no se modifica) |
| **Plan de pruebas y bugs** | [Proyecto TE en Jira](https://amigo-team-dauluhlg.atlassian.net/jira/software/projects/TE/boards/67/backlog) |
| **Reporte de la última ejecución en `main`** | https://sebastxzz.github.io/equipo-4-automatizacion/ |
| **Entrega del laboratorio** | [`ENTREGA.md`](ENTREGA.md) (decisiones, bugs, diagnóstico, medidas y reflexión) |
| **Equipo 4** | Simon Restrepo Aristizabal · Jhoan Sebastián Palacio · Juan Pablo Cartagena · |

## Qué cubre

- **41 pruebas** sobre 15 historias de usuario: catálogo, carrito, descuentos e IVA, checkout y confirmación del pedido.
- **27 de los 61 casos** del plan de pruebas de Jira (≈ 44 %).
- **10 bugs del producto** documentados como *fallo esperado* (`test.fail`) con su issue de Jira. Cuando el equipo de desarrollo corrija uno, la prueba empezará a fallar con «Expected to fail, but passed»: ese es el aviso para quitar la anotación.
- 3 pruebas heredadas diagnosticadas (defecto de la prueba, bug del producto y prueba frágil).

| Bug en Jira | Qué pasa |
|---|---|
| TE-85 · TE-86 | El carrito permite superar el stock (agregando de nuevo o con «+») |
| TE-87 | «−» permite llegar a 0 y a cantidades negativas |
| TE-89 | El código de descuento distingue mayúsculas de minúsculas |
| TE-91 | Un código inválido borra el descuento válido ya aplicado |
| TE-92 | El IVA y el total no se calculan sobre el valor descontado |
| TE-93 | Se puede ir a pagar con el total en cero |
| TE-96 | La validación de correo rechaza puntos, guiones, «+» y dominios compuestos |
| TE-97 | El formulario conserva los datos de la compra anterior |
| TE-98 | El número de pedido se repite después de recargar la página |

## Puesta en marcha

Requisitos: **Node.js 20 o superior** (`node -v`) y **Git**. Se descarga un navegador de pruebas (~600 MB).

```bash
git clone https://github.com/SebasTxZz/equipo-4-automatizacion.git
cd equipo-4-automatizacion
npm ci
npx playwright install chromium
npx playwright test 00-humo     # debe terminar en "1 passed"
```

## Comandos

| Comando | Para qué sirve |
|---|---|
| `npm test` | Ejecuta toda la suite |
| `npx playwright test 02-carrito` | Ejecuta solo los archivos cuyo nombre contenga ese texto |
| `npm run test:bugs` | Ejecuta solo las pruebas que documentan un bug conocido (`@bug`) |
| `npm run test:sin-bugs` | Ejecuta todo lo demás |
| `npx playwright test --grep @US-15` | Ejecuta las pruebas de una historia de usuario |
| `npx playwright test --grep @caso-TE-33` | Ejecuta la prueba de un caso del plan de Jira |
| `npx playwright test --grep @bug-TE-92` | Ejecuta las pruebas que detectan un bug concreto |
| `npx playwright test --headed` | Ejecuta viendo el navegador |
| `npx playwright test --repeat-each=10` | Repite cada prueba 10 veces (detecta pruebas inestables) |
| `npm run report` | Abre el reporte HTML de la última ejecución |
| `BASE_URL=http://localhost:3000 npx playwright test` | Apunta la suite a una copia local de la tienda |

## Trazabilidad con Jira

Cada prueba lleva etiquetas que la conectan con el plan de pruebas y con los bugs:

| Etiqueta | Significado | Ejemplo |
|---|---|---|
| `@US-xx` | Historia de usuario | `@US-04` |
| `@caso-TE-nn` | Caso de prueba (subtarea CP-xx.y) del plan en Jira | `@caso-TE-33` |
| `@bug` | La prueba documenta un bug conocido (`test.fail`) | |
| `@bug-TE-nn` | Issue de Jira del bug que detecta | `@bug-TE-85` |
| `@heredada` | Prueba heredada diagnosticada en el laboratorio | |

```ts
test('CA3: 4 + 4 mochilas supera el stock (6) y debe rechazarse',
  { tag: ['@US-04', '@caso-TE-33', '@bug', '@bug-TE-85'] },
  async ({ page }) => {
    test.fail(true, 'TE-85 · agregar 4 + 4 supera el stock: solo se valida la cantidad nueva, no la acumulada');
    // …
  });
```

## Estructura

```
tests/
  00-humo           Prueba de humo: ¿funciona el entorno?
  01-catalogo       Catálogo de productos (US-01)
  02-carrito        Agregar, aumentar, disminuir y quitar productos (US-04 a US-07)
  03-descuentos-iva Códigos de descuento, IVA y total (US-09 a US-12)
  04-checkout       Ir a pagar, datos de envío y validación de correo (US-13 a US-15)
  05-confirmacion   Confirmación del pedido y carrito limpio (US-16 a US-19)
  heredados         Pruebas heredadas diagnosticadas
pages/TiendaPage.ts Page Object: acciones y localizadores de la tienda en un solo lugar
playwright.config.ts
.github/workflows   Ejecuta la suite en cada push y publica el reporte de main
ENTREGA.md          Documento de entrega del laboratorio
```

## Convenciones

- **Arrange · Act · Assert** (Dado · Cuando · Entonces) en cada prueba, con títulos que dicen el criterio que verifican.
- **Page Object:** las pruebas cuentan la historia (`agregar`, `aplicarCodigo`, `comprar`); el HTML vive solo en `pages/TiendaPage.ts`. Las aserciones (`expect`) se quedan en las pruebas.
- **Independencia:** cada prueba arranca con un navegador limpio y no depende de otra.
- **Sin pausas fijas:** se espera una *condición* (los `expect` de Playwright reintentan solos), nunca un tiempo.
- **Una prueba roja no siempre es un bug:** primero se diagnostica (producto, prueba, inestabilidad o entorno). Solo los bugs confirmados del producto se marcan con `test.fail('TE-nn · descripción')`.

## Integración continua

[`playwright.yml`](.github/workflows/playwright.yml) ejecuta la suite en una máquina limpia (Ubuntu 24.04, Node 22, Chromium) en cada push y pull request, reintenta una vez las pruebas que fallan y guarda el reporte como artefacto (`reporte-playwright`). En `main` el reporte HTML también se publica en GitHub Pages.
