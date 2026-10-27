import { describe, expect, it } from 'vitest';
import { slubenyTermin } from '../data/demo/scenar1_slubeny_termin';
import { SKLAD_NAHLAD } from './MiniNahlad';

/** Čísla v hero musia sedieť so skladovým prehľadom situácie 1 a odkazy s id jej možností. */
describe('živá ukážka v hero', () => {
  const sklad = slubenyTermin.podklady.find((p) => p.id === 's1-sklad');
  const tabulka = sklad?.bloky.find((b) => b.typ === 'tabulka');

  it('má rovnaké počty kusov ako skladový prehľad situácie 1', () => {
    expect(tabulka?.typ).toBe('tabulka');
    if (!tabulka || tabulka.typ !== 'tabulka') return;
    const text = tabulka.riadky.map((r) => r.join(' ')).join('\n');
    for (const r of SKLAD_NAHLAD) {
      const riadok = tabulka.riadky.find((x) => x[0]?.startsWith(`${r.produkt} `) || x[0] === r.produkt);
      expect(riadok, `riadok ${r.produkt}`).toBeTruthy();
      const cisla = (riadok ?? []).slice(1).join(' ');
      expect(cisla).toContain(String(r.naSklade));
      expect(cisla).toContain(String(r.rezervovane));
      expect(cisla).toContain(String(r.volne));
    }
    expect(text).toContain('L-240');
  });

  it('odkazuje na existujúce možnosti prvého rozhodnutia', () => {
    const idMoznosti = slubenyTermin.uzly.flatMap((u) => ('moznosti' in u && Array.isArray(u.moznosti) ? u.moznosti.map((m) => m.id) : []));
    expect(idMoznosti).toContain('s1-start-potvrdit');
    expect(idMoznosti).toContain('s1-start-overit');
  });
});
