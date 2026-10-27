#!/usr/bin/env node
/**
 * Obrázok náhľadu odkazu (og:image) 1200×630 zo skutočného hero úvodnej stránky.
 * Žiadne vymyslené údaje: odfotí sa to, čo je na webe (nadpis, podtext a živá ukážka),
 * bez hlavičky, tlačidiel, ceny a odkazu pre vedúceho, s adresou chybynaskusku.online pod textom.
 *
 *   npm run preview            (v druhom okne, port 4177)
 *   npm run og                 [NAHLAD_URL=http://127.0.0.1:4177] [OG_VYSTUP=public/og.png]
 *
 * Spustiť po každej zmene hero a výsledok pushnúť. Doplnkové selektory na skrytie
 * (napr. nový prvok v hero) sa dajú pridať premennou OG_SKRYT="sel1, sel2".
 * Chromium sa hľadá rovnako ako v nahlady.mjs.
 */
import { chromium } from '@playwright/test';
import { existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const zaklad = process.env.NAHLAD_URL ?? 'http://127.0.0.1:4177';
const vystup = path.resolve(process.env.OG_VYSTUP ?? 'public/og.png');
const SIRKA = 1200;
const VYSKA = 630;
// Voľný okraj nad a pod obsahom hero; keď sa obsah nezmestí, stránka sa vykreslí širšia a zmenší sa.
const OKRAJ = 36;
const MAX_ZMENSENIE = 1.5;

// Čo na obrázku nemá byť: hlavička, pás pre návštevu z mailu, odkaz na preskočenie, tlačidlá,
// cena, odkaz pre vedúceho a popis pod ukážkou. Ostane nadznak, nadpis, podtext a živá ukážka.
const SKRYT = [
  'header',
  '.hlavicka',
  '.pas-z-mailu',
  '.preskocit',
  '.hero__akcie',
  '.hero__cena',
  '.hero__veducemu',
  '.hero__popis',
  ...(process.env.OG_SKRYT ? process.env.OG_SKRYT.split(',').map((s) => s.trim()).filter(Boolean) : []),
];

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

const exe = existsSync(chromium.executablePath()) ? undefined : najdiChromium();
const browser = await chromium.launch(exe ? { executablePath: exe } : {});
const chyby = [];

/**
 * Otvorí úvodnú stránku v okne mierka-krát väčšom (pri mierke 1 presne 1200×630),
 * pripraví hero a vráti výšku jeho obsahu v CSS pixeloch.
 */
async function otvor(mierka) {
  const ctx = await browser.newContext({
    viewport: { width: Math.round(SIRKA * mierka), height: Math.round(VYSKA * mierka) },
    deviceScaleFactor: 1 / mierka,
    locale: 'sk-SK',
    reducedMotion: 'reduce',
  });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => chyby.push(e.message));
  await page.goto(`${zaklad}/`);
  await page.waitForLoadState('networkidle');
  await page.evaluate(() => document.fonts.ready);
  await page.addStyleTag({ content: `${SKRYT.join(',\n')} { display: none !important; }` });
  const vyska = await page.evaluate(
    ({ okraj, vyskaOkna }) => {
      const nadpis = document.querySelector('.hero h1, main h1, h1');
      if (!nadpis) throw new Error('Na úvodnej stránke chýba nadpis H1.');
      const hero = nadpis.closest('.hero') ?? nadpis.closest('section') ?? nadpis.parentElement;

      // Ďalšie sekcie, pätička a spodná linka hero nemajú presvitať na okraji obrázka.
      for (let el = hero; el.parentElement && el !== document.body; el = el.parentElement) {
        for (const surodenec of el.parentElement.children) {
          if (surodenec !== el) surodenec.style.setProperty('visibility', 'hidden', 'important');
        }
      }
      hero.style.setProperty('border-bottom-color', 'transparent', 'important');

      // Výzvy na kliknutie v texte hero (mimo živej ukážky) skryť, adresu webu pridať pod text.
      for (const el of hero.querySelectorAll('.tlacidlo, a[href^="mailto:"]')) {
        if (!el.closest('[class*="nahlad"]')) el.style.setProperty('display', 'none', 'important');
      }
      const adresa = document.createElement('p');
      adresa.textContent = 'chybynaskusku.online';
      adresa.style.cssText =
        'margin:24px 0 0;font-family:var(--pismo-mono, monospace);font-size:22px;font-weight:600;' +
        'letter-spacing:0;color:var(--akcent, #0b6b57)';
      nadpis.parentElement.appendChild(adresa);

      // Obsah hero = zjednotenie viditeľných textov, ukážky a obrázkov (bez dekorácií a odsadení).
      let hore = Infinity;
      let dole = -Infinity;
      for (const el of hero.querySelectorAll('h1, h2, h3, p, ul, ol, dl, table, img, svg, [class*="nahlad"]')) {
        const r = el.getBoundingClientRect();
        if (r.width === 0 || r.height === 0 || getComputedStyle(el).visibility === 'hidden') continue;
        hore = Math.min(hore, r.top + window.scrollY);
        dole = Math.max(dole, r.bottom + window.scrollY);
      }
      const vyskaObsahu = dole - hore;
      // Obsah na stred okna; keď je vyšší, začne sa od jeho horného okraja.
      const posun = vyskaObsahu + 2 * okraj <= vyskaOkna ? hore - (vyskaOkna - vyskaObsahu) / 2 : hore - okraj;
      window.scrollTo(0, Math.max(0, posun));
      return vyskaObsahu;
    },
    { okraj: OKRAJ, vyskaOkna: Math.round(VYSKA * mierka) },
  );
  return { ctx, page, vyska };
}

let { ctx, page, vyska } = await otvor(1);
const potrebnaMierka = (vyska + 2 * OKRAJ) / VYSKA;
if (potrebnaMierka > 1) {
  // Vyšší obsah: širšie okno a menšie vykreslenie, aby sa hero zmestilo celé.
  // Mierka po 1/30, aby okno (40k × 21k) aj výsledok (presne 1200×630) vyšli v celých pixeloch.
  const mierka = Math.min(Math.ceil(potrebnaMierka * 30) / 30, MAX_ZMENSENIE);
  await ctx.close();
  ({ ctx, page, vyska } = await otvor(mierka));
  if (vyska + 2 * OKRAJ > VYSKA * mierka) console.warn(`Pozor: hero je vysoké ${Math.round(vyska)} px a spodok sa oreže.`);
}

await page.waitForTimeout(200);
const png = await page.screenshot();
const sirka = png.readUInt32BE(16);
const vyskaPng = png.readUInt32BE(20);
if (sirka !== SIRKA || vyskaPng !== VYSKA) chyby.push(`obrázok má ${sirka}×${vyskaPng} px namiesto ${SIRKA}×${VYSKA}`);
mkdirSync(path.dirname(vystup), { recursive: true });
writeFileSync(vystup, png);
await ctx.close();
await browser.close();

if (chyby.length > 0) {
  console.error('\nProblémy:\n' + chyby.join('\n'));
  process.exit(1);
}
console.log(`${vystup} (${sirka}×${vyskaPng}, ${png.length} B) z ${zaklad}/`);
