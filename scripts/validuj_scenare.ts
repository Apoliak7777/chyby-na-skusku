/**
 * Validácia scenárov z príkazového riadka.
 *
 *   npm run validate                         → verejné demo (src/data/demo)
 *   npx tsx scripts/validuj_scenare.ts <dir> → iný tréning (napr. treningy_klientov/firma)
 *
 * Skončí s kódom 1, ak validácia nájde chybu. Upozornenia neblokujú.
 */
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import type { Trening } from '../src/data/types';
import { formatujNalez, validujTrening, zhrnNalezy } from '../src/engine/validacia';

const priecinok = process.argv[2] ?? 'src/data/demo';
const subor = path.resolve(process.cwd(), priecinok, 'index.ts');

const modul = (await import(pathToFileURL(subor).href)) as { trening?: Trening; default?: Trening };
const trening = modul.trening ?? modul.default;

if (!trening) {
  console.error(`Súbor ${subor} neexportuje „trening“.`);
  process.exit(1);
}

console.log(`Tréning: ${trening.nazov} (${trening.id}, verzia ${trening.verzia}, režim ${trening.rezim})`);
console.log(`Firma: ${trening.znacka.nazovFirmy}${trening.znacka.jeModelova ? ' – modelová' : ''}`);
console.log(`Scenáre: ${trening.scenare.length}`);
for (const s of trening.scenare) {
  const rozhodnutia = s.uzly.filter((u) => u.typ === 'rozhodnutie').length;
  const zavery = s.uzly.filter((u) => u.typ === 'zaver').length;
  console.log(`  - ${s.nazov} (${s.id}): ${rozhodnutia} rozhodovacích uzlov, ${zavery} záverov, ${s.kontrolneBody.length} kontrolných bodov, schválenie: ${s.schvalenie.stav}`);
}

const nalezy = validujTrening(trening);
const { chyby, upozornenia } = zhrnNalezy(nalezy);

console.log('');
for (const n of nalezy) console.log(formatujNalez(n));
console.log(`\nVýsledok: ${chyby} chýb, ${upozornenia} upozornení.`);

process.exit(chyby > 0 ? 1 : 0);
