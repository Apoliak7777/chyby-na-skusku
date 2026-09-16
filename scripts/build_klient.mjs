#!/usr/bin/env node
/**
 * Zostaví samostatný klientsky tréning (len prehrávač, bez predajného webu).
 *
 *   node scripts/build_klient.mjs treningy_klientov/<firma> [vystupny-priecinok]
 *
 * Postup: validácia scenárov → kontrola typov → vite build s aliasom @trening
 * nasmerovaným na priečinok klienta. Výstup ide predvolene do dist-klient/.
 * Klientske priečinky sú v .gitignore, do verejného repozitára sa nedostanú.
 */
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
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

function spusti(popis, prikaz, args) {
  console.log(`\n== ${popis}`);
  const r = spawnSync(prikaz, args, { stdio: 'inherit', env, shell: process.platform === 'win32' });
  if (r.status !== 0) {
    console.error(`${popis}: skončilo s chybou (${r.status}).`);
    process.exit(r.status ?? 1);
  }
}

spusti('Validácia scenárov', npx, ['tsx', 'scripts/validuj_scenare.ts', absolutny]);
spusti('Kontrola typov', npx, ['tsc', '--noEmit', '-p', 'tsconfig.json']);
spusti('Build', npx, ['vite', 'build']);

console.log(`\nHotovo. Klientsky tréning je v priečinku ${env.VYSTUP_DIR}.`);
console.log('Pred nasadením si prečítajte docs/NASADENIE.md (kontrola prístupu k internému obsahu).');
