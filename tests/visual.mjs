/**
 * Revisión visual y responsive de Casa Filo con Chromium headless.
 * Captura cada sección, recorre el flujo de reserva y mide desbordes.
 */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const OUT = process.argv[2] || "shots";
mkdirSync(OUT, { recursive: true });

const BASE = "http://localhost:3000";

const browser = await chromium.launch();
const problems = [];

/** Mide si algo se sale del ancho del documento sin estar recortado. */
const OVERFLOW_PROBE = `(() => {
  const d = document.documentElement, b = document.body;
  const docW = d.clientWidth;
  const clipped = el => {
    let n = el.parentElement;
    while (n && n !== b) {
      if (/hidden|auto|scroll|clip/.test(getComputedStyle(n).overflowX)) return true;
      n = n.parentElement;
    }
    return false;
  };
  const bad = [];
  b.querySelectorAll('*').forEach(el => {
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height) return;
    if (r.right > docW + 1 && !clipped(el) && !el.querySelector('*')) {
      bad.push({ tag: el.tagName, cls: String(el.className || '').slice(0, 70), right: Math.round(r.right), text: (el.textContent || '').trim().slice(0, 32) });
    }
  });
  return { docW, scrollW: d.scrollWidth, canScrollX: b.scrollWidth > docW + 1, offenders: bad.slice(0, 6) };
})()`;

async function settle(page) {
  await page.waitForLoadState("networkidle").catch(() => {});
  // Recorre la página para disparar los revelados y cargar las imágenes.
  await page.evaluate(async () => {
    const step = window.innerHeight * 0.8;
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 160));
    }
    window.scrollTo(0, 0);
    await new Promise((r) => setTimeout(r, 400));
  });
  await page.waitForLoadState("networkidle").catch(() => {});
  await page.waitForTimeout(900);
}

async function newPage(width, height) {
  const context = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();
  const errors = [];
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text().slice(0, 200));
  });
  page.on("pageerror", (e) => errors.push("pageerror: " + String(e).slice(0, 200)));
  page.on("response", (r) => {
    if (r.status() >= 400) errors.push(`HTTP ${r.status()} ${r.url().slice(0, 150)}`);
  });
  page.errors = errors;
  return page;
}

/* ── 1. Escritorio: una captura por sección ───────────────────────── */

console.log("\n== Escritorio 1440x900 ==");
{
  const page = await newPage(1440, 900);
  await page.goto(BASE, { waitUntil: "domcontentloaded" });
  await settle(page);

  const probe = await page.evaluate(OVERFLOW_PROBE);
  console.log("  overflow:", JSON.stringify(probe).slice(0, 320));
  if (probe.canScrollX) problems.push(`desktop: scroll horizontal (${probe.scrollW} > ${probe.docW})`);

  const sections = await page.evaluate(() =>
    [...document.querySelectorAll("main > section")].map((s, i) => ({
      i,
      id: s.id || "s" + i,
      top: s.offsetTop,
      h: s.offsetHeight,
    })),
  );

  for (const s of sections) {
    await page.evaluate((t) => window.scrollTo(0, t), s.top);
    await page.waitForTimeout(950);
    await page.screenshot({ path: `${OUT}/d-${String(s.i).padStart(2, "0")}-${s.id}.png` });
  }

  // Pie de página
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(900);
  await page.screenshot({ path: `${OUT}/d-99-footer.png` });

  if (page.errors.length) {
    console.log("  errores de consola:", page.errors.slice(0, 4));
    problems.push("desktop: errores de consola -> " + page.errors[0]);
  } else {
    console.log("  consola limpia");
  }
  await page.context().close();
}

/* ── 2. Flujo de reserva ──────────────────────────────────────────── */

console.log("\n== Flujo de reserva 1440x900 ==");
{
  const page = await newPage(1440, 900);
  await page.goto(BASE, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2500);

  await page.getByRole("button", { name: "Agendar cita" }).first().click();
  await page.waitForTimeout(1100);
  const sheet = page.getByRole("dialog");
  await page.screenshot({ path: `${OUT}/b-1-servicio.png` });

  await sheet.getByRole("button", { name: /Corte & Barba/ }).click();
  await page.waitForTimeout(1100);
  await page.screenshot({ path: `${OUT}/b-2-barbero.png` });

  await sheet.getByRole("button", { name: /Tadeo Lazcano/ }).click();
  await page.waitForTimeout(1800);
  await page.screenshot({ path: `${OUT}/b-3-fecha.png` });

  // Primer día con disponibilidad
  const day = page.locator('button[aria-label*="horarios libres"]:not([disabled])').first();
  await day.waitFor({ timeout: 10000 });
  const dayLabel = await day.getAttribute("aria-label");
  console.log("  día elegido:", dayLabel);
  await day.click();
  await page.waitForTimeout(1800);
  await page.screenshot({ path: `${OUT}/b-4-hora.png` });

  const slot = page.locator('button[aria-label*="disponible"]:not([aria-label*="no disponible"])').first();
  await slot.waitFor({ timeout: 10000 });
  const slotLabel = await slot.getAttribute("aria-label");
  console.log("  horario elegido:", slotLabel);
  await slot.click();
  await page.waitForTimeout(1400);
  await page.screenshot({ path: `${OUT}/b-5-datos.png` });

  await sheet.getByLabel("Nombre completo").fill("Andrés Quiroz");
  await sheet.getByLabel("Teléfono").fill("33 2184 9077");
  await sheet.getByLabel("Correo").fill("andres.quiroz@correo.mx");
  await sheet.getByLabel(/Nota para el barbero/).fill("Traigo el remolino de la coronilla muy abierto, por favor dejar un poco más largo arriba.");
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${OUT}/b-5b-datos-llenos.png` });

  await sheet.getByRole("button", { name: "Continuar" }).click();
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `${OUT}/b-6-resumen.png` });

  await sheet.getByRole("button", { name: /Confirmar cita/ }).click();
  await page.waitForTimeout(2600);
  await page.screenshot({ path: `${OUT}/b-7-confirmacion.png`, fullPage: true });

  const code = await page.locator("text=/^CF-[A-Z0-9]{4}$/").first().textContent().catch(() => null);
  console.log("  folio:", code);
  if (!code) problems.push("reserva: no apareció el folio en la confirmación");

  // Cancelar para comprobar el cambio de estado en pantalla
  await sheet.getByRole("button", { name: /Cancelar esta cita/ }).click();
  await page.waitForTimeout(600);
  await sheet.getByRole("button", { name: /Sí, cancelar la cita/ }).click();
  await page.waitForTimeout(1800);
  await page.screenshot({ path: `${OUT}/b-8-cancelada.png`, fullPage: true });
  const cancelled = await page.locator("text=Cita cancelada").count();
  console.log("  estado cancelada visible:", cancelled > 0);
  if (!cancelled) problems.push("reserva: la cancelación no se refleja en pantalla");

  if (page.errors.length) {
    console.log("  errores de consola:", page.errors.slice(0, 4));
    problems.push("reserva: errores de consola -> " + page.errors[0]);
  }
  await page.context().close();
}

/* ── 3. Responsive ────────────────────────────────────────────────── */

for (const [label, w, h] of [
  ["movil", 390, 844],
  ["movil-chico", 360, 780],
  ["tablet", 768, 1024],
  ["laptop", 1280, 800],
  ["ancho", 1920, 1080],
]) {
  console.log(`\n== ${label} ${w}x${h} ==`);
  const page = await newPage(w, h);
  await page.goto(BASE, { waitUntil: "domcontentloaded" });
  await settle(page);

  const probe = await page.evaluate(OVERFLOW_PROBE);
  console.log("  docW", probe.docW, "scrollW", probe.scrollW, "scrollX", probe.canScrollX);
  if (probe.offenders.length) console.log("  se salen:", JSON.stringify(probe.offenders));
  if (probe.canScrollX) problems.push(`${label}: scroll horizontal (${probe.scrollW} > ${probe.docW})`);

  await page.screenshot({ path: `${OUT}/r-${label}-01.png` });
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight * 0.26));
  await page.waitForTimeout(900);
  await page.screenshot({ path: `${OUT}/r-${label}-02.png` });
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight * 0.55));
  await page.waitForTimeout(900);
  await page.screenshot({ path: `${OUT}/r-${label}-03.png` });
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight * 0.82));
  await page.waitForTimeout(900);
  await page.screenshot({ path: `${OUT}/r-${label}-04.png` });

  if (page.errors.length) problems.push(`${label}: consola -> ${page.errors[0]}`);
  await page.context().close();
}

/* ── 4. Menú y reserva en móvil ───────────────────────────────────── */

console.log("\n== Móvil: menú y reserva ==");
{
  const page = await newPage(390, 844);
  await page.goto(BASE, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2500);

  await page.getByRole("button", { name: "Abrir menú" }).click();
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `${OUT}/m-1-menu.png` });

  const menuProbe = await page.evaluate(OVERFLOW_PROBE);
  if (menuProbe.canScrollX) problems.push("móvil menú: scroll horizontal");

  await page.getByRole("button", { name: "Cerrar menú" }).click();
  await page.waitForTimeout(900);

  await page.evaluate(() => window.scrollTo(0, 900));
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `${OUT}/m-2-barra-flotante.png` });

  await page.getByRole("button", { name: "Agendar cita" }).last().click();
  await page.waitForTimeout(1300);
  const msheet = page.getByRole("dialog");
  await page.screenshot({ path: `${OUT}/m-3-servicio.png` });

  await msheet.getByRole("button", { name: /Navaja Caliente/ }).click();
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `${OUT}/m-4-barbero.png` });

  await msheet.getByRole("button", { name: /Sin preferencia/ }).click();
  await page.waitForTimeout(1800);
  await page.screenshot({ path: `${OUT}/m-5-fecha.png` });

  const day = page.locator('button[aria-label*="horarios libres"]:not([disabled])').first();
  await day.waitFor({ timeout: 10000 });
  await day.click();
  await page.waitForTimeout(1800);
  await page.screenshot({ path: `${OUT}/m-6-hora.png` });

  const slot = page.locator('button[aria-label*="disponible"]:not([aria-label*="no disponible"])').first();
  await slot.waitFor({ timeout: 10000 });
  await slot.click();
  await page.waitForTimeout(1300);
  await page.screenshot({ path: `${OUT}/m-7-datos.png` });

  const sheetProbe = await page.evaluate(OVERFLOW_PROBE);
  if (sheetProbe.canScrollX) problems.push("móvil reserva: scroll horizontal");

  // El pie del panel tiene que caber en la pantalla: con flex-1 sin min-h-0
  // la altura mínima del contenido lo empujaba fuera del teléfono.
  const fit = await page.evaluate(() => {
    const f = document.querySelector('[role="dialog"] footer');
    if (!f) return null;
    const r = f.getBoundingClientRect();
    return { bottom: Math.round(r.bottom), vh: window.innerHeight };
  });
  console.log("  pie del panel:", JSON.stringify(fit));
  if (fit && fit.bottom > fit.vh + 1) {
    problems.push(`móvil reserva: el pie se sale ${fit.bottom - fit.vh}px de la pantalla`);
  }

  if (page.errors.length) {
    console.log("  errores de consola:", page.errors.slice(0, 4));
    problems.push("móvil: consola -> " + page.errors[0]);
  }
  await page.context().close();
}

/* ── 5. Galería y ficha de barbero ────────────────────────────────── */

console.log("\n== Galería y ficha ==");
{
  const page = await newPage(1440, 900);
  await page.goto(BASE, { waitUntil: "domcontentloaded" });
  await settle(page);

  await page.locator("#barberos").scrollIntoViewIfNeeded();
  await page.waitForTimeout(900);
  await page.getByRole("button", { name: /Ismael Rentería/ }).first().click();
  await page.waitForTimeout(1300);
  await page.screenshot({ path: `${OUT}/x-1-ficha-barbero.png` });
  await page.keyboard.press("Escape");
  await page.waitForTimeout(800);

  await page.locator("#galeria").scrollIntoViewIfNeeded();
  await page.waitForTimeout(900);
  await page.locator("#galeria button").first().click();
  await page.waitForTimeout(1400);
  await page.screenshot({ path: `${OUT}/x-2-lightbox.png` });
  await page.getByRole("button", { name: "Imagen siguiente" }).click();
  await page.waitForTimeout(1100);
  await page.screenshot({ path: `${OUT}/x-3-lightbox-siguiente.png` });
  await page.keyboard.press("Escape");
  await page.waitForTimeout(800);

  if (page.errors.length) problems.push("galería: consola -> " + page.errors[0]);
  await page.context().close();
}

await browser.close();

console.log("\n────────────────────────────────");
if (problems.length === 0) {
  console.log("Sin problemas detectados.");
} else {
  console.log(`${problems.length} problema(s):`);
  problems.forEach((p) => console.log("  · " + p));
}
console.log(`Capturas en ${OUT}/`);
