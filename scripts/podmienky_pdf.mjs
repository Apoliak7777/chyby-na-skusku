#!/usr/bin/env node
/**
 * Podmienky pilotu (docs/PODMIENKY_PILOTU.md) do jednostranového PDF na poslanie klientovi.
 *
 *   npm run podmienky        ->  vystupy/Podmienky_pilotu.pdf
 *
 * Zdrojom je Markdown v docs/, aby text ostal na jednom mieste. Skript ho prevedie
 * na jednoduché HTML v písme a farbách webu a vytlačí cez Chromium z Playwrightu
 * do PDF A4. Keď sa text nezmestí na jednu stranu, skript skončí chybou:
 * vtedy sa kráti text, nie písmo.
 */
import { chromium } from '@playwright/test';
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const zdroj = path.resolve('docs/PODMIENKY_PILOTU.md');
const vystupDir = path.resolve('vystupy');
const vystup = path.join(vystupDir, 'Podmienky_pilotu.pdf');
mkdirSync(vystupDir, { recursive: true });

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

// ---- Markdown -> HTML (len to, čo podmienky používajú: nadpisy, odseky, odrážky, číslovanie, tučné)
const unik = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const riadkovy = (s) =>
  unik(s)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/info@chybynaskusku\.online/g, '<a href="mailto:info@chybynaskusku.online">info@chybynaskusku.online</a>')
    .replace(/(^|[\s,])chybynaskusku\.online(?=[\s,.]|$)/g, '$1<a href="https://chybynaskusku.online">chybynaskusku.online</a>');

function naHtml(md) {
  const von = [];
  let zoznam = null; // 'ul' | 'ol'
  let odsek = [];
  let prvyOdsek = true;
  const zavriZoznam = () => {
    if (zoznam) von.push(`</${zoznam}>`);
    zoznam = null;
  };
  const zavriOdsek = () => {
    if (odsek.length) {
      von.push(`<p${prvyOdsek ? ' class="uvod"' : ''}>${riadkovy(odsek.join(' '))}</p>`);
      prvyOdsek = false;
    }
    odsek = [];
  };
  for (const raw of md.split(/\r?\n/)) {
    const r = raw.trimEnd();
    let m;
    if (!r.trim()) {
      zavriOdsek();
      zavriZoznam();
    } else if ((m = /^# (.+)$/.exec(r))) {
      zavriOdsek();
      zavriZoznam();
      von.push(`<h1>${riadkovy(m[1])}</h1>`);
    } else if ((m = /^## (.+)$/.exec(r))) {
      zavriOdsek();
      zavriZoznam();
      prvyOdsek = false;
      von.push(`<h2>${riadkovy(m[1])}</h2>`);
    } else if ((m = /^[-*] (.+)$/.exec(r))) {
      zavriOdsek();
      if (zoznam !== 'ul') {
        zavriZoznam();
        zoznam = 'ul';
        von.push('<ul>');
      }
      von.push(`<li>${riadkovy(m[1])}</li>`);
    } else if ((m = /^\d+\. (.+)$/.exec(r))) {
      zavriOdsek();
      if (zoznam !== 'ol') {
        zavriZoznam();
        zoznam = 'ol';
        von.push('<ol>');
      }
      von.push(`<li>${riadkovy(m[1])}</li>`);
    } else {
      zavriZoznam();
      odsek.push(r.trim());
    }
  }
  zavriOdsek();
  zavriZoznam();
  // posledný odsek (kontakt) je pätička
  const i = von.length - 1;
  if (von[i]?.startsWith('<p>')) von[i] = von[i].replace('<p>', '<p class="pata">');
  return von.join('\n');
}

const pismo = path.resolve('node_modules/@fontsource-variable/plus-jakarta-sans/files');
const fontFace = ['latin', 'latin-ext']
  .map((sada) => path.join(pismo, `plus-jakarta-sans-${sada}-wght-normal.woff2`))
  .filter((f) => existsSync(f))
  .map(
    (f) =>
      `@font-face{font-family:'Plus Jakarta Sans';font-style:normal;font-weight:200 800;font-display:block;src:url('${pathToFileURL(f).href}') format('woff2-variations');}`,
  )
  .join('\n');

const html = `<!doctype html>
<html lang="sk"><head><meta charset="utf-8"><title>Podmienky pilotu Chyby na skúšku</title>
<style>
${fontFace}
@page { size: A4; margin: 13mm 18mm 12mm; }
html, body { margin: 0; padding: 0; }
body { font-family: 'Plus Jakarta Sans', 'Segoe UI', Arial, sans-serif; font-size: 10.4pt; line-height: 1.42;
       color: #0f2a4a; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
h1 { font-size: 19pt; line-height: 1.15; letter-spacing: -0.015em; margin: 0 0 1.6mm; font-weight: 700; }
.uvod { color: #4a5f78; margin: 0 0 3mm; }
h2 { font-size: 11.4pt; margin: 3.1mm 0 1mm; color: #0e7c66; font-weight: 700; }
p, ul, ol { margin: 0 0 1.2mm; }
ul, ol { padding-left: 4.6mm; }
li { margin: 0 0 0.6mm; padding-left: 0.6mm; }
li::marker { color: #0e7c66; }
strong { font-weight: 700; }
a { color: #0e7c66; text-decoration: none; }
.pata { margin-top: 3mm; padding-top: 2.2mm; border-top: 1px solid #d5dde8; color: #4a5f78; }
</style></head><body>
${naHtml(readFileSync(zdroj, 'utf8'))}
</body></html>`;

const htmlSubor = path.join(vystupDir, 'podmienky_pilotu.html');
writeFileSync(htmlSubor, html, 'utf8');

const exe = existsSync(chromium.executablePath()) ? undefined : najdiChromium();
const browser = await chromium.launch(exe ? { executablePath: exe } : {});
try {
  // šírka okna = šírka potlačiteľnej plochy A4 (210 - 36 mm) pri 96 dpi, aby zalomenie sedelo s tlačou
  const page = await browser.newPage({ viewport: { width: 658, height: 1000 } });
  await page.goto(pathToFileURL(htmlSubor).href);
  await page.evaluate(() => document.fonts.ready);
  await page.emulateMedia({ media: 'print' });
  const vyska = await page.evaluate(() => document.body.getBoundingClientRect().height);
  const pdf = await page.pdf({ path: vystup, format: 'A4', preferCSSPageSize: true, printBackground: true });
  const stran = (pdf.toString('latin1').match(/\/Type\s*\/Page(?![s\w])/g) ?? []).length;
  const potlacitelna = ((297 - 13 - 12) / 25.4) * 96; // px, podľa @page margin
  console.log(`${path.relative(process.cwd(), vystup)}  (${(pdf.length / 1024).toFixed(0)} kB, ${stran} strana/strany, obsah ${Math.round(vyska)} px z ${Math.round(potlacitelna)} px)`);
  if (stran !== 1) {
    console.error('Podmienky sa nezmestili na jednu stranu. Skráťte text v docs/PODMIENKY_PILOTU.md.');
    process.exitCode = 1;
  }
} finally {
  await browser.close();
}
