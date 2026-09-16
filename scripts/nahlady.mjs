#!/usr/bin/env node
/**
 * Snímky obrazovky webu a dema (desktop, mobil, tlač) do priečinka nahlady/.
 *
 *   npm run preview            (v druhom okne, port 4177)
 *   node scripts/nahlady.mjs   [NAHLAD_URL=http://127.0.0.1:4177]
 *
 * Používa Chromium z Playwrightu; ak predvolená verzia nie je stiahnutá, vezme
 * najnovší build z priečinka ms-playwright (rovnako ako playwright.config.ts).
 */
import { chromium } from '@playwright/test';
import { existsSync, mkdirSync, readdirSync } from 'node:fs';
import path from 'node:path';

const zaklad = process.env.NAHLAD_URL ?? 'http://127.0.0.1:4177';
const vystup = path.resolve('nahlady');
mkdirSync(vystup, { recursive: true });

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

async function snimka(nazov, sirka, vyska, url, akcie, tlac = false, celaStranka = true) {
  const ctx = await browser.newContext({ viewport: { width: sirka, height: vyska }, locale: 'sk-SK', reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => chyby.push(`${nazov}: ${e.message}`));
  page.on('console', (m) => {
    if (m.type() === 'error') chyby.push(`${nazov}: ${m.text()}`);
  });
  await page.goto(zaklad + url);
  await page.waitForLoadState('networkidle');
  if (akcie) await akcie(page);
  if (tlac) await page.emulateMedia({ media: 'print' });
  const sirkaDokumentu = await page.evaluate(() => document.documentElement.scrollWidth);
  if (sirkaDokumentu > sirka) chyby.push(`${nazov}: vodorovné pretekanie (${sirkaDokumentu} > ${sirka})`);
  const subor = path.join(vystup, `${nazov}.png`);
  await page.screenshot({ path: subor, fullPage: celaStranka });
  console.log(`${nazov}.png (${sirka}×${vyska}${tlac ? ', tlač' : ''})`);
  await ctx.close();
}

const naKartu = async (p) => {
  await p.getByRole('button', { name: /Otvoriť produktovú kartu K-6/ }).click();
  await p.getByLabel('Množstvo (bal)').fill('18');
};

await snimka('00_hero_viewport', 1280, 820, '/', undefined, false, false);
await snimka('01_web_desktop', 1280, 900, '/');
await snimka('02_demo_situacie', 1280, 900, '/#/demo');
await snimka('03_scenar1_start', 1280, 900, '/#/demo/slubeny-termin');
await snimka('04_scenar1_spatna_vazba', 1280, 900, '/#/demo/slubeny-termin', async (p) => {
  await p.getByRole('button', { name: /Potvrdiť piatok hneď/ }).click();
  await p.getByText('Rozhodnutie č. 2').waitFor();
});
await snimka('05_scenar2_vstup', 1280, 900, '/#/demo/kusy-alebo-balenia', naKartu);
await snimka('06_suhrn_chyba', 1280, 900, '/#/demo/kusy-alebo-balenia', async (p) => {
  await naKartu(p);
  await p.getByRole('button', { name: 'Pokračovať na rekapituláciu' }).click();
  await p.getByRole('button', { name: /Potvrdiť – množstvo 18 sedí/ }).click();
  await p.getByRole('heading', { name: 'Chyba s následkom' }).waitFor();
});
await snimka('07_mobil_web', 360, 740, '/');
await snimka('07a_mobil_hero', 360, 740, '/', undefined, false, false);
await snimka('08_mobil_scenar_podklady', 360, 740, '/#/demo/zmena-adresy', async (p) => {
  await p.getByRole('button', { name: /Zobraziť podklady/ }).click();
});
await snimka(
  '09_tlac_suhrn',
  1000,
  900,
  '/#/demo/kusy-alebo-balenia',
  async (p) => {
    await naKartu(p);
    await p.getByRole('button', { name: 'Pokračovať na rekapituláciu' }).click();
    await p.getByRole('button', { name: /Potvrdiť – množstvo 18 sedí/ }).click();
    await p.getByRole('heading', { name: 'Chyba s následkom' }).waitFor();
  },
  true,
);
await snimka('10_dopyt', 1280, 900, '/#dopyt', async (p) => {
  await p.getByLabel('Firma *').fill('Veľkoobchod Test s. r. o.');
  await p.getByLabel('Kontaktný e-mail *').fill('objednavky@test-firma.sk');
  await p.getByLabel('Pracovná pozícia na zaškolenie *').fill('Pracovník príjmu objednávok');
  await p.getByLabel('Jedna situácia, ktorú chcete precvičiť *').fill('Nováčik potvrdí termín bez toho, aby pozrel rezervácie v sklade.');
  await p.getByRole('button', { name: 'Pripraviť dopyt' }).click();
  await p.getByRole('heading', { name: /Dopyt je pripravený/ }).waitFor();
});

await browser.close();

if (chyby.length > 0) {
  console.error('\nProblémy:\n' + chyby.join('\n'));
  process.exit(1);
}
console.log(`\nHotovo, náhľady sú v ${vystup}. Bez chýb v konzole a bez pretekania.`);
