#!/usr/bin/env node
/**
 * Snímky skutočnej ukážky pre sekciu „Čo dostanete“ na predajnej stránke (public/img/).
 *
 *   npm run build && npm run preview   (v druhom okne, port 4177)
 *   node scripts/snimky_webu.mjs       [NAHLAD_URL=http://127.0.0.1:4177]
 *
 * Fotí len výrezy toho, čo ukážka naozaj robí: rozhodnutie so spätnou väzbou, spísané pravidlá
 * firmy a záver „Čo uvidí vedúci“ po dvoch odohraných situáciách. Po zmene ukážky spustiť znova.
 */
import { chromium } from '@playwright/test';
import { existsSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';

const zaklad = process.env.NAHLAD_URL ?? 'http://127.0.0.1:4177';
const vystup = path.resolve('public/img');
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

// Oprava po chybe v situácii 1 a chyba s nákladom v situácii 2 (texty tlačidiel ako v e2e/demo.spec.ts).
const KROKY_S1 = [/Zavolať zákazníkovi a povedať mu skutočný stav/, /Poslať zákazníkovi porovnanie/, /Rezervovať 8 kusov L-240B a poslať/];
const KROKY_S2 = [
  (p) => p.getByRole('button', { name: /Pozrieť produktovú kartu K-6/ }).click(),
  (p) => p.getByLabel('Množstvo (bal)').fill('18'),
  (p) => p.getByRole('button', { name: 'Pokračovať na rekapituláciu' }).click(),
  (p) => p.getByRole('button', { name: 'Potvrdiť objednávku.', exact: true }).click(),
];

const exe = existsSync(chromium.executablePath()) ? undefined : najdiChromium();
const browser = await chromium.launch(exe ? { executablePath: exe } : {});
const chyby = [];

// Úzke okno (rozloženie ako na tablete), dvojnásobná hustota pre ostrý obraz. Fotia sa len výrezy
// podstatnej časti, aby boli na predajnej stránke čitateľné aj v malom ráme.
const ctx = await browser.newContext({ viewport: { width: 560, height: 900 }, deviceScaleFactor: 2, locale: 'sk-SK', reducedMotion: 'reduce' });
const page = await ctx.newPage();
page.on('pageerror', (e) => chyby.push(e.message));
page.on('console', (m) => {
  if (m.type() === 'error') chyby.push(m.text());
});

// Bez hlavičky, pätičky, predajného bloku a pomocnej poznámky panela: na snímke má byť len to,
// čo dostane klient. Rozmery výsledných súborov treba prepísať do poľa VYSTUPY v Landing.tsx.
const LEN_TRENING = '.hlavicka, .paticka, .preskocit, .majitel, .podklady__poznamka { display: none !important; }';

async function odfot(prvok, nazov) {
  await page.addStyleTag({ content: LEN_TRENING });
  await prvok.scrollIntoViewIfNeeded();
  await page.waitForTimeout(200);
  const subor = path.join(vystup, nazov);
  await prvok.screenshot({ path: subor, type: 'jpeg', quality: 82 });
  console.log(`${nazov} (${Math.round(statSync(subor).size / 1024)} kB)`);
}

// 1. Tréning: chybné rozhodnutie, spätná väzba s následkom a ďalší krok.
await page.goto(`${zaklad}/#/demo/slubeny-termin?prva=s1-start-potvrdit`);
await page.waitForLoadState('networkidle');
await odfot(page.locator('.uzol').first(), 'ukazka-trening.jpg');

// 2. Spísané pravidlá firmy v podkladoch situácie.
await page.getByRole('button', { name: /Podklady/ }).first().click();
await page.getByRole('tab', { name: /Pravidlá firmy/ }).click();
await odfot(page.getByRole('tabpanel'), 'ukazka-pravidla.jpg');

// 3. „Čo uvidí vedúci“: situácia 1 s opravenou chybou, situácia 2 s chybou a nákladom.
//    Kroky klikania sú prevzaté z e2e/demo.spec.ts; keď sa zmenia texty možností, upraviť aj tu.
await page.goto(`${zaklad}/#/demo/slubeny-termin?prva=s1-start-potvrdit`);
for (const moznost of KROKY_S1) await page.getByRole('button', { name: moznost }).click();
await page.locator('#suhrn-nadpis').waitFor();
await page.evaluate(() => {
  window.location.hash = '#/demo/kusy-alebo-balenia';
});
for (const krok of KROKY_S2) await krok(page);
await page.locator('#suhrn-nadpis').waitFor();
await page.evaluate(() => {
  window.location.hash = '#/demo/prehlad';
});
await page.getByRole('heading', { level: 1, name: 'Čo uvidí vedúci' }).waitFor();
await odfot(page.locator('.zaver-prehladu').first(), 'ukazka-veduci.jpg');

await browser.close();
if (chyby.length) {
  console.error(`Chyby v konzole:\n${chyby.join('\n')}`);
  process.exit(1);
}
console.log(`Hotovo, snímky sú v ${vystup}.`);
