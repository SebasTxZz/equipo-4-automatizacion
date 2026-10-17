// Toma una captura del reporte HTML de Playwright por cada bug de Jira (prueba etiquetada @bug-TE-nn).
// Uso: con el reporte ya servido en http://127.0.0.1:9323  →  node scripts/capturas-reporte.mjs
import { chromium } from '@playwright/test';
import fs from 'node:fs';

const BASE = process.env.REPORTE_URL ?? 'http://127.0.0.1:9323';
const BUGS = ['TE-85', 'TE-86', 'TE-87', 'TE-89', 'TE-91', 'TE-92', 'TE-93', 'TE-96', 'TE-97', 'TE-98'];

fs.mkdirSync('evidencias', { recursive: true });
const navegador = await chromium.launch();
const contexto = await navegador.newContext({ viewport: { width: 1280, height: 1000 } });
let fallos = 0;

for (const bug of BUGS) {
  const pagina = await contexto.newPage();
  try {
    // El reporte filtra con  #?q=<texto>: aquí, las pruebas con la etiqueta del bug.
    await pagina.goto(`${BASE}/#?q=${encodeURIComponent('@bug-' + bug)}`);
    const primera = pagina.locator('a[href*="testId="]').first();
    await primera.waitFor({ timeout: 20_000 });
    await primera.click();
    await pagina.waitForURL(/testId=/, { timeout: 10_000 });
    await pagina.waitForTimeout(1500); // el detalle (anotación, error y captura) se pinta al abrir la prueba
    await pagina.screenshot({ path: `evidencias/${bug}-reporte.png`, fullPage: true });
    console.log(`OK  ${bug}`);
  } catch (error) {
    fallos++;
    console.error(`ERR ${bug}: ${error.message}`);
    await pagina.screenshot({ path: `evidencias/${bug}-ERROR.png`, fullPage: true }).catch(() => {});
  } finally {
    await pagina.close();
  }
}

await navegador.close();
process.exit(fallos > 0 ? 1 : 0);
