# Entrega · Laboratorio 3.1 · Introducción a la automatización de pruebas

**Equipo:** `equipo-4` · **Integrantes:** _(completar con los nombres del equipo)_ · **Repositorio:** https://github.com/SebasTxZz/equipo-4-automatizacion

> Proyecto de Jira: **TE** (plan de pruebas TE-2 a TE-82 · bugs TE-83 a TE-101). Los fallos esperados del código apuntan a esas claves.

## 1. ¿Qué automatizamos y por qué? (decisión)

| Criterio (US-xx · CAy) | ¿Automatizamos? | Por qué (frecuencia · riesgo · estabilidad · facilidad de verificar) |
|---|---|---|
| US-04 · CA2 (7 mochilas con stock 6 avisa) | Sí | Regla de negocio de alto riesgo (vender lo que no hay); el `alert()` se verifica de forma exacta y estable. |
| US-04 · CA3 (4 + 4 mochilas) | Sí | Mismo riesgo; a mano exige repetir pasos y contar unidades. Destapa el bug TE-85. |
| US-06 · CA2 («−» con cantidad 1) | Sí | Frontera clásica (valor 1 → 0); se ejecuta en un segundo y falla siempre igual (TE-87). |
| US-09 · CA1 y CA3 (DESC10 y variantes) | Sí | Cálculo repetitivo con datos; una prueba por variante dice exactamente cuál falla (TE-89). |
| US-10 · CA2 (código inválido no borra descuento) | Sí | Interacción entre dos estados; fácil olvidarla a mano (TE-91). |
| US-11 · CA2 y US-12 · CA2 (IVA y total con descuento) | Sí | Dinero: riesgo alto y verificable con un oráculo calculado en la prueba (TE-92). |
| US-13 · CA3 (no pagar con total cero) | Sí | Riesgo alto (cobro incorrecto) y verificación binaria: el botón está o no deshabilitado (TE-93). |
| US-14 · CA1 y CA2 (campos obligatorios) | Sí | Frecuente, estable y con mensajes de texto exactos. |
| US-15 · CA1-CA5 (correos válidos/mal formados) | Sí | Muchas entradas casi iguales: ideal para pruebas dirigidas por datos (TE-96). |
| US-16 · CA1 (formulario vacío en la compra siguiente) | Sí | Privacidad de datos; es un flujo largo que a mano es tedioso de repetir (TE-97). |
| US-17 · CA1-CA3 (número de pedido) | Sí | Flujo completo repetible; CA3 exige recargar y comparar números (TE-98). |
| US-19 · CA1 (carrito limpio tras comprar) | Sí | Cierra el flujo de compra; verificación simple y estable. |
| US-20 · CA1 (campos con etiqueta asociada) | Sí | `getByLabel` verifica la asociación etiqueta-campo de forma automática (TE-100). |
| US-01 · CA4 (sin scroll horizontal a 375 px) | Más adelante | Es automatizable (viewport móvil) pero no entró en este laboratorio; es el reto opcional. |
| US-18 · CA3 (dirección larga no rompe el diseño) | No | Es una verificación visual; una aserción de DOM no dice si "se ve bien". |
| US-20 · CA3 y CA4 (contraste de colores) | No | Requiere medir contraste con herramienta especializada (axe) o criterio visual humano. |

## 2. Bugs que nuestra suite detecta

Todas las pruebas de esta tabla quedan con `test.fail(true, 'TE-xx · …')` como primera línea. La evidencia es el reporte HTML de Playwright (artefacto `reporte-playwright` de GitHub Actions), donde cada una conserva la anotación y el error (`Expected` / `Received`).

| Prueba (archivo › título) | Bug en Jira (clave) | ¿Quedó con `test.fail(...)`? | Evidencia (captura o trace) |
|---|---|---|---|
| 02-carrito › US-04 CA3: 4 + 4 mochilas supera el stock | TE-85 | Sí | Reporte: anotación `fail` TE-85 y el error de la aserción (cantidad esperada 4). |
| 02-carrito › US-05 CA2: «+» no pasa del stock | TE-86 | Sí | Reporte: anotación `fail` TE-86 y el error de la aserción (cantidad esperada 6). |
| 02-carrito › US-06 CA2: «−» con cantidad 1 | TE-87 | Sí | Reporte: anotación `fail` TE-87 y el error de la aserción (cantidad esperada 1). |
| 03-descuentos › CA3: códigos `desc10` y `Desc10` (2 filas) | TE-89 | Sí, solo esas 2 filas | Reporte: anotación `fail` TE-89 en esas 2 filas; `" DESC10 "` pasa sin anotación. |
| 03-descuentos › US-10 CA2: código inválido no borra el descuento | TE-91 | Sí | Reporte: anotación `fail` TE-91 y el error (descuento esperado $ 6.500). |
| 03-descuentos › US-11 CA2 y US-12 CA2 (IVA y total con descuento) | TE-92 (mismo bug) | Sí, las 2 pruebas | Reporte: anotación `fail` TE-92 y el error contra el valor calculado por el oráculo. |
| 04-checkout › US-13 CA3: no se paga con total cero | TE-93 | Sí | Reporte: anotación `fail` TE-93 y el error de `toBeDisabled()`. |
| 04-checkout › US-15 correos válidos (4 de 6 filas) y `ana@gmail.c` | TE-96 | Sí, solo las filas afectadas | Reporte: anotación `fail` TE-96 en esas filas (5 en total: 4 correos válidos + `ana@gmail.c`). |
| 04-checkout › US-20 CA1: campos con etiqueta (`getByLabel`) | TE-100 | Sí | Reporte: anotación `fail` TE-100 y el error de `getByLabel`. |
| 05-confirmacion › US-16 CA1: formulario vacío en la compra siguiente | TE-97 | Sí | Reporte: anotación `fail` TE-97 y el error de `toHaveValue('')`. |
| 05-confirmacion › US-17 CA3: número de pedido tras recargar | TE-98 | Sí | Reporte: anotación `fail` TE-98 y el error de la comparación de números de pedido. |
| heredados › H2: IVA de 2 mochilas con DESC20 | TE-92 | Sí | `Expected "$ 19.760"` · `Received "$ 24.700"` |

**¿Cuántos bugs hay detrás de US-11 y US-12?** Uno solo (TE-92): el IVA se calcula sin tener en cuenta el descuento y el total hereda el error. Se corrigen juntos, pero conviene tener las dos pruebas porque verifican dos criterios distintos.

**Pruebas de correos válidos (US-15):** fallan 4 de las 6 filas (`ana.gomez@`, `ana-gomez@`, `ana+tienda@` y `ana@universidad.edu.co`); solo pasan `juan@correo.com` y `ana_gomez@gmail.com`. Lo que tienen en común: la validación solo admite letras, números y guion bajo en el nombre y un único punto en el dominio. Es **un** bug (TE-96), pero su descripción en Jira menciona solo puntos y dominios compuestos: hay que agregar el guion y el «+».

## 3. Pruebas heredadas: nuestro diagnóstico

| Prueba | Veredicto (producto / prueba / inestable / entorno) | Cómo lo comprobamos | Qué hicimos |
|---|---|---|---|
| H1 · el catálogo tiene 6 productos | **Defecto de la prueba** | Falla siempre igual: `Expected 6 · Received 8`. A mano la tienda muestra 8 y el criterio US-01 · CA1 (TE-22) exige 8: el dato de la prueba estaba desactualizado. | Se corrigió la prueba a 8 productos. |
| H2 · el IVA de 2 mochilas con DESC20 es $ 19.760 | **Bug del producto** (TE-92) | Cálculo del oráculo: 2 × $ 65.000 = $ 130.000; DESC20 = $ 26.000; IVA = 19% de $ 104.000 = **$ 19.760**. La tienda muestra `$ 24.700` (= 19% de $ 130.000, sin descontar). Falla siempre igual y coincide con el bug TE-92. | Se mantuvo la prueba (afirma lo correcto) y se marcó `test.fail` con TE-92. |
| H3 · agregar un cuaderno justo después de cargar | **Frágil / inestable en potencia (no reproducida)** | Se repitió 30 veces en CI cuatro variantes (original, con pausa de 300 ms, esperando el encabezado y esperando `networkidle`), también con la CPU 8 veces más lenta: 240 de 240 pasaron. **No logramos reproducir el fallo.** La prueba esperaba solo `domcontentloaded` y hacía clic sin comprobar que el catálogo estuviera pintado. | Se estabilizó esperando una condición (encabezado del catálogo visible) en lugar de un tiempo. Se descartó `waitForTimeout`. |

## 4. Medidas

- Casos de prueba de nuestro plan en Jira: **61** (subtareas CP-01.1 a CP-20.4, TE-22 a TE-82) · automatizados en este laboratorio: **29** (**≈ 48 %**). El resto no se automatizó o se dejó para más adelante (ver sección 1).
- Pruebas en la suite: **43** (de ellas 3 ejemplos del laboratorio, la prueba de humo y 3 heredadas) · pruebas con fallo esperado documentado: **18**.
- Tiempo de ejecutar toda la suite en GitHub Actions: **≈ 60 s** (paso «Ejecutar las pruebas», `fullyParallel`).
- Tiempo que nos tomó escribir las pruebas automatizadas: **≈ 120 min** _(estimado; reemplacen por el tiempo real del equipo)_.
- Tiempo estimado de ejecutar **a mano** esos 29 casos: **≈ 60 min** (supuesto: 2 min por caso, incluyendo repetir los pasos de compra) _(ajusten con su propia medición)_.
- ¿En cuántas ejecuciones se paga la automatización? Inversión 120 min ÷ ahorro por ejecución (60 − 1 = 59 min) ≈ **2,03 → a partir de la tercera ejecución**.

## 5. Reflexión (máximo 5 líneas cada una)

1. **¿Qué casos de nuestro plan no automatizaríamos y por qué?** Los de contraste de color (US-20 CA3/CA4) y la dirección larga que se sale del contenedor (US-18 CA3): son juicios visuales y una aserción de DOM no los captura. Tampoco automatizaríamos algo que cambia cada semana.
2. **Si la tienda cambia el HTML de un botón, ¿qué parte de nuestro código se rompe y cuál no?** Se rompe solo `pages/TiendaPage.ts`, en el método de ese botón; las pruebas, que cuentan la historia (`agregar`, `aplicarCodigo`, `comprar`), siguen intactas. El Page Object convirtió un cambio en N pruebas en un cambio en un solo lugar.
3. **Una prueba roja nuestra que no era un bug del producto:** H1. Lo vimos porque `Expected 6 · Received 8` coincidía con lo que se veía a mano y con el criterio US-01 · CA1: el dato de la prueba estaba viejo, no la tienda.
4. **¿Qué bug o riesgo no habría encontrado la automatización por sí sola?** El contraste insuficiente y el desborde de la dirección larga (visuales), y la experiencia real con un lector de pantalla: `getByLabel` detecta la etiqueta sin asociar, pero no dice si el flujo se entiende al escucharlo.
5. **¿Qué haríamos distinto en un proyecto real?** Pediríamos identificadores de prueba (`data-testid`) y etiquetas asociadas, ejecutaríamos la suite en cada pull request, y guardaríamos los datos de prueba fuera del código para no depender de textos que cambian.
