# Entrega · Laboratorio 3.1 · Introducción a la automatización de pruebas

**Equipo:** `equipo-1` · **Integrantes:** Simon Restrepo Aristizabal, Jhoan Palacio, Juan Cartagena, Sebastián · **Repositorio:** https://github.com/SebasTxZz/equipo-4-automatizacion

> Plan de pruebas y bugs en Jira (proyecto TIENDA ESCOLAR, clave TE): https://amigo-team-dauluhlg.atlassian.net/browse/TE

## 1. ¿Qué automatizamos y por qué? (decisión)

| Criterio (US-xx · CAy) | ¿Automatizamos? | Por qué (frecuencia · riesgo · estabilidad · facilidad de verificar) |
|---|---|---|
| US-01 · CA1-CA3 (catálogo: 8 productos, precio y stock, formato de precios) | Sí | Se repite en cada despliegue; estable; la máquina lee el DOM sin ambigüedad. Ejemplo resuelto de la plantilla. |
| US-04 · CA1-CA3 (agregar sin superar el stock) | Sí | Riesgo alto (sobreventa); entradas y salidas numéricas exactas; se prueba en segundos. |
| US-05 · CA2 (“+” no pasa del stock) | Sí | Mismo riesgo de sobreventa; frontera clara (cantidad = stock). |
| US-06 · CA2 (“−” no baja de 1) | Sí | Valor límite; destapó un bug de severidad alta. |
| US-07 · CA2 (quitar el único producto) | Sí | Flujo corto y estable. |
| US-09 · CA1, CA3 (código de descuento y variantes) | Sí | Varias entradas del mismo tipo: ideal para pruebas dirigidas por datos. |
| US-10 · CA1-CA2 (código inválido) | Sí | Riesgo económico (el cliente pierde un descuento); verificación exacta. |
| US-11 y US-12 · CA2 (IVA y total con descuento) | Sí | Cálculo monetario: riesgo alto y fácil de verificar con un oráculo calculado en la prueba. |
| US-13 · CA3 (no ir a pagar con total ≤ 0) | Sí | Riesgo de cobro incorrecto; un botón deshabilitado es fácil de verificar. |
| US-14 · CA1-CA2 (datos de envío obligatorios) | Sí | Reglas de validación repetitivas y estables. |
| US-15 · CA1-CA4 (correos válidos y mal formados) | Sí | Muchas clases de datos: una prueba por correo. |
| US-16 · CA1 (formulario vacío tras otra compra) | Sí | Riesgo de privacidad; requiere un flujo largo que a mano es tedioso. |
| US-17 · CA1-CA3 (confirmación y número de pedido) | Sí | Flujo central del negocio; se reutiliza `comprar()`. |
| US-19 · CA1 (carrito limpio tras comprar) | Sí | Estable y barato. |
| US-20 (lector de pantalla, nombres accesibles) | No (por ahora) | Requiere juicio humano con un lector real; solo parte (nombres accesibles) se podría automatizar con axe-core. |
| US-18 · CA (resumen con dirección larga, desbordes visuales) | No | Verificar que algo “se ve bien” necesita ojos humanos o pruebas visuales aparte. |

## 2. Bugs que nuestra suite detecta

| Prueba (archivo › título) | Bug en Jira (clave) | ¿Quedó con `test.fail(...)`? | Evidencia (captura o trace) |
|---|---|---|---|
| 02-carrito › US-04 CA3: 4 + 4 mochilas supera el stock | TE-85 | Sí | Reporte HTML / trace de la ejecución local |
| 02-carrito › US-05 CA2: “+” no pasa del stock | TE-86 | Sí | ídem |
| 02-carrito › US-06 CA2: “−” no la deja en 0 | TE-87 | Sí | ídem |
| 03-descuentos-iva › US-09 CA3: “desc10” y “Desc10” (2 filas) | TE-89 | Sí, solo esas 2 filas | ídem |
| 03-descuentos-iva › US-10 CA2: código inválido no borra descuento | TE-91 | Sí | ídem |
| 03-descuentos-iva › US-11 CA2 y US-12 CA2: IVA y total con descuento | TE-92 (un solo bug, dos criterios) | Sí | ídem |
| 04-checkout › US-13 CA3: total ≤ 0 no permite pagar | TE-93 | Sí | ídem |
| 04-checkout › US-15: 4 correos válidos rechazados | TE-96 | Sí, solo esas 4 filas | ídem |
| 05-confirmacion › US-16 CA1: formulario vacío | TE-97 | Sí | ídem |
| 05-confirmacion › US-17 CA3: número de pedido tras recargar | TE-98 | Sí | ídem |
| heredados › H2: IVA de 2 mochilas con DESC20 | TE-92 | Sí | ídem |

Pregunta de la guía (US-11 y US-12): es **el mismo bug**: el IVA se calcula antes de aplicar el descuento. En Jira hay **un** issue (TE-92) enlazado a las dos historias.

## 3. Pruebas heredadas: nuestro diagnóstico

| Prueba | Veredicto (producto / prueba / inestable / entorno) | Cómo lo comprobamos | Qué hicimos |
|---|---|---|---|
| H1 · el catálogo tiene 6 productos | **Prueba** (defecto de la prueba) | El catálogo muestra 8 productos, igual que exige US-01 CA1 y comprueba `01-catalogo`. La expectativa de 6 era un dato viejo. | Corregimos la expectativa a 8. |
| H2 · el IVA de 2 mochilas con DESC20… | **Producto** (bug TE-92) | A mano: 2 × $ 65.000 = $ 130.000; − 20 % = $ 104.000; IVA 19 % = $ 19.760 (lo que espera la prueba). La tienda muestra $ 24.700 (19 % del subtotal bruto). | Dejamos la prueba como está y la marcamos `test.fail('TE-92 · …')`. |
| H3 · agregar un cuaderno justo después de cargar | **Inestable** (sincronización de la prueba) — _confirmar con `npx playwright test heredados -g H3 --repeat-each=10` sobre la versión original (`git log -p tests/heredados.spec.ts`)_ | La prueba original hacía clic con `waitUntil: 'domcontentloaded'` sin esperar el catálogo y apuntaba al “primer Agregar”, no a la tarjeta del cuaderno. | Esperamos el catálogo (`tienda.abrir()`) y usamos la tarjeta del cuaderno. |

## 4. Medidas

> Completar después de ejecutar la suite en su computador (las cifras de tiempo son suyas).

- Casos de prueba de nuestro plan en Jira: **61** · automatizados en este laboratorio: **\_\_** (**\_\_ %**) — la suite cubre 15 historias con 41 pruebas (cada correo y cada código cuenta como una prueba).
- Tiempo que nos tomó escribir las pruebas automatizadas: **\_\_ min** · tiempo de ejecutar toda la suite: **\_\_ s**
- Tiempo estimado de ejecutar **a mano** esos mismos casos: **\_\_ min**
- ¿En cuántas ejecuciones se paga la automatización? (inversión ÷ ahorro por ejecución): **\_\_**

## 5. Reflexión (máximo 5 líneas cada una)

1. **¿Qué casos no automatizaríamos?** Los de accesibilidad con lector de pantalla (US-20) y los visuales como el desborde de una dirección larga (US-18): necesitan criterio humano. Tampoco los que cambian cada semana.
2. **Si la tienda cambia el HTML de un botón:** solo se rompe `pages/TiendaPage.ts` (el localizador de ese botón); las 41 pruebas siguen iguales porque llaman a `agregar()`, `aplicarCodigo()`, etc. Sin el Page Object habría que editar muchas pruebas.
3. **Una prueba roja que no era bug:** H1 (esperaba 6 productos y hay 8). Nos dimos cuenta porque US-01 CA1 y el ejemplo resuelto exigen 8: el requisito decide quién está mal, la prueba o el producto.
4. **Qué no habría encontrado la automatización sola:** problemas de uso y de lectura (textos confusos, un diseño que se rompe en móvil, la experiencia con lector de pantalla) y bugs en reglas que nadie escribió como criterio.
5. **En un proyecto real:** automatizaríamos primero los flujos de dinero, correríamos la suite en cada push, guardaríamos el reporte y revisaríamos con el equipo cada `test.fail` cuando el bug se corrija (la prueba empezará a fallar al “pasar”).
