#!/usr/bin/env node
/**
 * Ikony webu zo súboru public/favicon.svg:
 *
 *   public/favicon.ico           32 a 48 px (PNG vo formáte ICO), záloha pre prehliadače a poštu bez SVG
 *   public/apple-touch-icon.png  180 px, logo na nepriehľadnom pozadí #13202f s okrajom (iOS, záložky)
 *
 *   npm run ikony
 *
 * Spustiť po každej zmene loga. Vykresľuje Chromium z Playwrightu; ak predvolená verzia
 * nie je stiahnutá, vezme najnovší build z priečinka ms-playwright (rovnako ako nahlady.mjs).
 * ICO sa skladá priamo v Node, bez ďalších závislostí.
 */
import { chromium } from '@playwright/test';
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const verejne = path.resolve('public');
const svg = readFileSync(path.join(verejne, 'favicon.svg'), 'utf8');
const svgData = `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;

const VELKOSTI_ICO = [32, 48];
const APPLE_VELKOST = 180;
const APPLE_POZADIE = '#13202f';
const APPLE_OKRAJ = 22;

function najdiChromium() {
  if (process.env.CHROMIUM_EXE) return process.env.CHROMIUM_EXE;
  const koren = process.env.PLAYWRIGHT_BROWSERS_PATH || path.join(process.env.LOCALAPPDATA ?? '', 'ms-playwright');
  if (!existsSync(koren)) return undefined;
  const kandidati = readdirSync(koren)
    .map((n) => {
      const m = /^(chromium_headless_shell|chromium)-(\d+)$/.exec(n);
      return m ? { nazov: n, druh: m[1], cislo: Number(m[2]) } : null;
    })
    .filter(Boolean)
    .sort((a, b) => b.cislo - a.cislo || (a.druh === 'chromium_headless_shell' ? -1 : 1));
  for (const k of kandidati) {
    const exe =
      k.druh === 'chromium_headless_shell'
        ? path.join(koren, k.nazov, 'chrome-headless-shell-win64', 'chrome-headless-shell.exe')
        : path.join(koren, k.nazov, 'chrome-win64', 'chrome.exe');
    if (existsSync(exe)) return exe;
  }
  return undefined;
}

/** Rozmery PNG z hlavičky IHDR (kontrola, že vznikla presne požadovaná veľkosť). */
function rozmeryPng(png) {
  return { sirka: png.readUInt32BE(16), vyska: png.readUInt32BE(20) };
}

/** ICO s obrázkami PNG (podporuje Windows od Visty aj všetky súčasné prehliadače). */
function zlozIco(obrazky) {
  const hlavicka = Buffer.alloc(6);
  hlavicka.writeUInt16LE(0, 0); // rezervované
  hlavicka.writeUInt16LE(1, 2); // typ 1 = ikona
  hlavicka.writeUInt16LE(obrazky.length, 4);
  const adresar = Buffer.alloc(16 * obrazky.length);
  let posun = hlavicka.length + adresar.length;
  obrazky.forEach(({ velkost, png }, i) => {
    const z = i * 16;
    adresar.writeUInt8(velkost >= 256 ? 0 : velkost, z); // šírka (0 = 256)
    adresar.writeUInt8(velkost >= 256 ? 0 : velkost, z + 1); // výška
    adresar.writeUInt8(0, z + 2); // počet farieb palety
    adresar.writeUInt8(0, z + 3); // rezervované
    adresar.writeUInt16LE(1, z + 4); // roviny
    adresar.writeUInt16LE(32, z + 6); // bitov na pixel
    adresar.writeUInt32LE(png.length, z + 8);
    adresar.writeUInt32LE(posun, z + 12);
    posun += png.length;
  });
  return Buffer.concat([hlavicka, adresar, ...obrazky.map((o) => o.png)]);
}

const exe = existsSync(chromium.executablePath()) ? undefined : najdiChromium();
const browser = await chromium.launch(exe ? { executablePath: exe } : {});
const page = await browser.newPage({ deviceScaleFactor: 1 });

/** Vykreslí logo na plátno velkost × velkost; pozadie null = priehľadné. */
async function vykresli(velkost, pozadie = null, okraj = 0) {
  await page.setViewportSize({ width: velkost, height: velkost });
  const logo = velkost - 2 * okraj;
  await page.setContent(
    `<!doctype html><html><body style="margin:0;width:${velkost}px;height:${velkost}px;` +
      `background:${pozadie ?? 'transparent'};display:grid;place-items:center">` +
      `<img src="${svgData}" width="${logo}" height="${logo}" alt="" style="display:block"></body></html>`,
  );
  await page.locator('img').evaluate((img) => img.decode());
  const png = await page.screenshot({ omitBackground: pozadie === null, clip: { x: 0, y: 0, width: velkost, height: velkost } });
  const { sirka, vyska } = rozmeryPng(png);
  if (sirka !== velkost || vyska !== velkost) throw new Error(`Ikona má ${sirka}×${vyska} px namiesto ${velkost}×${velkost}.`);
  return png;
}

const obrazkyIco = [];
for (const velkost of VELKOSTI_ICO) obrazkyIco.push({ velkost, png: await vykresli(velkost) });
const ico = zlozIco(obrazkyIco);
writeFileSync(path.join(verejne, 'favicon.ico'), ico);
console.log(`favicon.ico (${VELKOSTI_ICO.map((v) => `${v}×${v}`).join(', ')}, ${ico.length} B)`);

const apple = await vykresli(APPLE_VELKOST, APPLE_POZADIE, APPLE_OKRAJ);
writeFileSync(path.join(verejne, 'apple-touch-icon.png'), apple);
console.log(`apple-touch-icon.png (${APPLE_VELKOST}×${APPLE_VELKOST}, ${apple.length} B)`);

await browser.close();
console.log(`\nHotovo, ikony sú v ${verejne}.`);
