#!/usr/bin/env node
/**
 * Zostaví samostatný klientsky tréning (len prehrávač, bez predajného webu).
 *
 *   node scripts/build_klient.mjs treningy_klientov/<firma> [vystupny-priecinok]
 *
 * Postup: validácia scenárov → kontrola typov → vite build s aliasom @trening
 * nasmerovaným na priečinok klienta → kontrola výstupu. Výstup ide predvolene do dist-klient/.
 * Klientske priečinky sú v .gitignore, do verejného repozitára sa nedostanú.
 *
 * Pri nastavenom TRENING_DIR vite.config.ts vynechá z index.html popis, canonical, náhľad
 * odkazu a JSON-LD verejného webu, doplní noindex a titulok tréningu a z public/ skopíruje
 * len ikony (bez CNAME, robots.txt, sitemap.xml, og.png, img/, 404.html a ukazka/). Konštanta
 * __KLIENT__ je pri preklade true, takže predajný web sa do JS vôbec nedostane; skript to
 * na konci overí aj v assets/*.js.
 */
import { spawnSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

const [, , priecinok, vystup = 'dist-klient'] = process.argv;

if (!priecinok) {
  console.error('Použitie: node scripts/build_klient.mjs <priecinok-treningu> [vystupny-priecinok]');
  process.exit(1);
}

const absolutny = path.resolve(process.cwd(), priecinok);
if (!existsSync(path.join(absolutny, 'index.ts'))) {
  console.error(`V priečinku ${absolutny} chýba index.ts, ktorý exportuje „trening“.`);
  process.exit(1);
}

const npx = process.platform === 'win32' ? 'npx.cmd' : 'npx';
const env = { ...process.env, TRENING_DIR: absolutny, VYSTUP_DIR: path.resolve(process.cwd(), vystup) };

// Na Windows ide npx.cmd cez shell; cesty s medzerou (napr. „Moje dokumenty“) treba dať do úvodzoviek,
// inak ich shell rozdelí na viac argumentov.
const doShellu = (arg) => (/[\s&()^]/.test(arg) ? `"${arg}"` : arg);

function spusti(popis, prikaz, args) {
  console.log(`\n== ${popis}`);
  const r =
    process.platform === 'win32'
      ? spawnSync([prikaz, ...args].map(doShellu).join(' '), { stdio: 'inherit', env, shell: true })
      : spawnSync(prikaz, args, { stdio: 'inherit', env });
  if (r.status !== 0) {
    console.error(`${popis}: skončilo s chybou (${r.status}).`);
    process.exit(r.status ?? 1);
  }
}

spusti('Validácia scenárov', npx, ['tsx', 'scripts/validuj_scenare.ts', absolutny]);
spusti('Kontrola typov', npx, ['tsc', '--noEmit', '-p', 'tsconfig.json']);
spusti('Build', npx, ['vite', 'build']);

// Poistka: do klientskeho buildu nesmie prejsť nič, čo patrí verejnému webu.
console.log('\n== Kontrola výstupu');
const problemy = [];
for (const subor of ['CNAME', 'robots.txt', 'sitemap.xml', 'og.png', 'img', '404.html', 'ukazka']) {
  if (existsSync(path.join(env.VYSTUP_DIR, subor))) problemy.push(`obsahuje ${subor} verejného webu`);
}
const html = readFileSync(path.join(env.VYSTUP_DIR, 'index.html'), 'utf8');
if (!/<meta name="robots" content="noindex, nofollow"/.test(html)) problemy.push('index.html nemá noindex');
for (const [znak, popis] of [
  ['og:', 'náhľad odkazu (og:)'],
  ['rel="canonical"', 'canonical'],
  ['application/ld+json', 'JSON-LD'],
  ['name="description"', 'popis predajného webu'],
]) {
  if (html.includes(znak)) problemy.push(`index.html obsahuje ${popis}`);
}

// JS bundle: predajný web, cenník a kontakt poskytovateľa majú byť pri preklade vypustené
// (__KLIENT__ vo vite.config.ts). Zamestnanec klienta by ich inak videl v zdrojovom kóde.
const ZAKAZANE_V_JS = [
  'chybynaskusku',
  'info@chybynaskusku.online',
  'Koľko to stojí',
  'Podmienky pilotu',
  'Toto bola vymyslená firma',
];
const assets = path.join(env.VYSTUP_DIR, 'assets');
const skripty = existsSync(assets) ? readdirSync(assets).filter((n) => n.endsWith('.js')) : [];
if (skripty.length === 0) problemy.push('v assets/ nie je žiadny .js súbor');
for (const nazov of skripty) {
  // Minifikátor môže diakritiku zapísať ako \uXXXX; pred hľadaním ju vrátime na znaky.
  const js = readFileSync(path.join(assets, nazov), 'utf8')
    .replace(/\\u\{([0-9a-fA-F]+)\}/g, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/\\u([0-9a-fA-F]{4})/g, (_, h) => String.fromCharCode(parseInt(h, 16)));
  for (const retazec of ZAKAZANE_V_JS) {
    if (js.includes(retazec)) problemy.push(`assets/${nazov} obsahuje „${retazec}“ z predajného webu`);
  }
}

if (problemy.length > 0) {
  console.error(`Klientsky build nie je čistý:\n- ${problemy.join('\n- ')}`);
  process.exit(1);
}
console.log('V poriadku: noindex, titulok tréningu, bez súborov, značiek a textov verejného webu.');

console.log(`\nHotovo. Klientsky tréning je v priečinku ${env.VYSTUP_DIR}.`);
console.log('Pred nasadením si prečítajte docs/NASADENIE.md (kontrola prístupu k internému obsahu).');
