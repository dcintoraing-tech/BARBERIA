import { chromium } from "playwright";
const [, , sel, out, w, h] = process.argv;
const browser = await chromium.launch();
const page = await (await browser.newContext({ viewport: { width: +(w || 1440), height: +(h || 900) } })).newPage();
await page.goto("http://localhost:3000", { waitUntil: "domcontentloaded" });
await page.evaluate(async () => {
  const s = window.innerHeight * 0.7;
  for (let y = 0; y < document.body.scrollHeight; y += s) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 170)); }
  window.scrollTo(0, 0);
});
await page.waitForTimeout(1800);
if (sel !== "top") await page.locator(sel).scrollIntoViewIfNeeded();
await page.waitForTimeout(2300);
await page.screenshot({ path: out });
await browser.close();
