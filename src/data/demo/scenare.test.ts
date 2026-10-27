import { describe, expect, it } from 'vitest';
import type { Id, Scenar } from '../types';
import { trening } from './index';
import { CENA_BALENIA, KUSOV_V_BALENI, NAKLAD_OPRAVY, POZADOVANE_KUSY, kusyAleboBalenia } from './scenar2_kusy_alebo_balenia';
import { slubenyTermin } from './scenar1_slubeny_termin';
import { zmenaAdresy } from './scenar3_zmena_adresy';
import { najdiTypickuChybu, novyPokus, odhadTrvania, vyberMoznost, vyhodnot, type Vyhodnotenie } from '../../engine/pokus';

/** Prejde všetky cesty scenára (graf je DAG) a vráti vyhodnotenie každej z nich. */
function vsetkyCesty(scenar: Scenar): Vyhodnotenie[] {
  const vysledky: Vyhodnotenie[] = [];
  const prejdi = (pokus: ReturnType<typeof novyPokus>) => {
    const uzol = scenar.uzly.find((u) => u.id === pokus.aktualnyUzol)!;
    if (uzol.typ === 'zaver') {
      vysledky.push(vyhodnot(scenar, pokus));
      return;
    }
    for (const m of uzol.moznosti) {
      const hodnota = m.hodnoty?.[0] ?? (m.ostatneHodnoty ? 7 : undefined);
      prejdi(vyberMoznost(scenar, pokus, m.id, hodnota));
    }
  };
  prejdi(novyPokus(scenar));
  return vysledky;
}

const scenare = trening.scenare;

describe('demo tréning', () => {
  it('má tri scenáre a je označený ako modelová firma', () => {
    expect(scenare).toHaveLength(3);
    expect(trening.rezim).toBe('demo');
    expect(trening.znacka.jeModelova).toBe(true);
    expect(trening.znacka.nazovFirmy).toBe('DEMO DISTRIBÚCIA');
    expect(scenare.map((s) => s.id)).toEqual(['slubeny-termin', 'kusy-alebo-balenia', 'zmena-adresy']);
  });

  it.each(scenare.map((s) => [s.nazov, s] as const))('%s: každá cesta sa dá dokončiť a bezchybná má 2 až 4 rozhodnutia', (_n, scenar) => {
    const cesty = vsetkyCesty(scenar);
    expect(cesty.length).toBeGreaterThan(3);
    for (const c of cesty) expect(c.dokonceny).toBe(true);
    const bezchybne = cesty.filter((c) => c.verdikt === 'zvladnute');
    expect(bezchybne.length).toBeGreaterThan(0);
    const najkratsia = Math.min(...bezchybne.map((c) => c.cesta.length));
    expect(najkratsia).toBeGreaterThanOrEqual(2);
    expect(najkratsia).toBeLessThanOrEqual(4);
  });

  it.each(scenare.map((s) => [s.nazov, s] as const))('%s: modelový náklad je len na vetvách s chybným záverom', (_n, scenar) => {
    for (const c of vsetkyCesty(scenar)) {
      if (c.naklad > 0) {
        expect(c.zaver?.vysledok).toBe('chyba');
      }
      if (c.zaver?.vysledok === 'spravne') {
        expect(c.naklad).toBe(0);
      }
    }
  });

  it.each(scenare.map((s) => [s.nazov, s] as const))('%s: chybný záver nikdy nemá všetky body správne na prvý pokus', (_n, scenar) => {
    for (const c of vsetkyCesty(scenar)) {
      if (c.zaver?.vysledok === 'chyba') {
        expect(c.pocty.spravne).toBeLessThan(scenar.kontrolneBody.length);
      }
    }
  });

  it('náklady v dátach sú presne tie zo zadania (120 €, 45 €, 65 €)', () => {
    const naklady = (s: Scenar) =>
      new Set(s.uzly.flatMap((u) => (u.typ === 'rozhodnutie' ? u.moznosti.map((m) => m.naklad).filter((n): n is number => n !== undefined) : [])));
    expect([...naklady(slubenyTermin)]).toEqual([120]);
    expect([...naklady(kusyAleboBalenia)]).toEqual([45]);
    expect([...naklady(zmenaAdresy)]).toEqual([65]);
  });

  it('podklady každého scenára obsahujú pravidlá a e-mail zákazníka', () => {
    for (const s of scenare) {
      expect(s.podklady.some((p) => p.druh === 'pravidla')).toBe(true);
      expect(s.podklady.some((p) => p.druh === 'email')).toBe(true);
    }
  });

  it.each(scenare.map((s) => [s.nazov, s] as const))('%s: typická chyba vedie k chybnému záveru s reťazou následkov', (_n, scenar) => {
    const t = najdiTypickuChybu(scenar);
    expect(t, 'typickaChyba').toBeTruthy();
    expect(t?.zaver.vysledok).toBe('chyba');
    expect(t?.zaver.retazNasledku?.length).toBeGreaterThanOrEqual(2);
    expect(t?.naklad).toBeGreaterThan(0);
  });

  it.each(scenare.map((s) => [s.nazov, s] as const))('%s: suma v reťazi následkov sedí s nákladom každej cesty k záveru', (_n, scenar) => {
    const cesty = vsetkyCesty(scenar);
    for (const u of scenar.uzly) {
      if (u.typ !== 'zaver' || !u.retazNasledku) continue;
      const sumy = u.retazNasledku.join(' ').match(/\d[\d ]*(?= €)/g)?.map((x) => Number(x.replace(/ /g, ''))) ?? [];
      const naklady = new Set(cesty.filter((c) => c.zaver?.id === u.id).map((c) => c.naklad));
      if (sumy.length === 0) {
        expect([...naklady], `záver ${u.id} bez sumy v reťazi`).toEqual([0]);
      } else {
        expect([...naklady], `záver ${u.id}`).toEqual([sumy[0]]);
      }
    }
  });

  it('texty ukážky sú bez dekoratívnych pomlčiek a bez „(modelový zákazník)“', () => {
    const text = JSON.stringify(trening);
    expect(text).not.toMatch(/ [–—] /);
    expect(text).not.toContain('modelový zákazník');
  });

  it.each(scenare.map((s) => [s.nazov, s] as const))('%s: možnosti neprezrádzajú odpoveď výpočtom ani zdôvodnením', (_n, scenar) => {
    // Prvá voľba situácie 1 má rovnaký text ako náhľad na predajnom webe.
    const vynimky = new Set(['s1-start-potvrdit']);
    for (const u of scenar.uzly) {
      if (u.typ !== 'rozhodnutie' || u.vstup) continue;
      for (const m of u.moznosti) {
        if (vynimky.has(m.id)) continue;
        expect(m.text, m.id).not.toMatch(/[€=÷×]/);
        expect(m.text.split(/[.?!](?:\s|$)/).filter((v) => v.trim()).length, `${m.id}: jedna veta`).toBe(1);
      }
    }
  });

  it.each(scenare.map((s) => [s.nazov, s] as const))('%s: správny záver vysvetľuje pravidlá, netvrdí kroky návštevníka', (_n, scenar) => {
    // Do správneho záveru vedú aj cesty s opravenou chybou, preto „Čo rozhodlo“ nehovorí, čo návštevník urobil.
    for (const u of scenar.uzly) {
      if (u.typ !== 'zaver' || u.vysledok !== 'spravne') continue;
      for (const v of u.vysvetlenie) expect(v, u.id).not.toMatch(/\bste\b/);
    }
  });

  it('prvé rozhodnutie situácie 1 má texty ako náhľad na predajnom webe', () => {
    const start = slubenyTermin.uzly.find((u) => u.id === slubenyTermin.vstupnyUzol);
    const texty = start?.typ === 'rozhodnutie' ? Object.fromEntries(start.moznosti.map((m) => [m.id, m.text])) : {};
    expect(texty['s1-start-potvrdit']).toBe('Potvrdiť piatok. Na sklade je 12 kusov.');
    expect(texty['s1-start-overit']).toBe('Odpovedať až po kontrole rezervácií.');
  });

  it('stručný opis situácie neprezrádza riešenie', () => {
    expect(slubenyTermin.strucnyProblem).not.toMatch(/voľn|rezerv/i);
    expect(kusyAleboBalenia.strucnyProblem).not.toMatch(/balen/i);
    expect(zmenaAdresy.strucnyProblem).not.toMatch(/štítok|nestačí/i);
  });

  it('prvá situácia má najkratšiu bezchybnú cestu so 4 rozhodnutiami a trvá asi 3 minúty', () => {
    expect(odhadTrvania(slubenyTermin)).toEqual({ rozhodnutia: 4, minuty: 3 });
    expect(odhadTrvania(kusyAleboBalenia).rozhodnutia).toBe(3);
    expect(odhadTrvania(zmenaAdresy).rozhodnutia).toBe(4);
  });
});

describe('scenár Kusy alebo balenia: výpočty', () => {
  const najdi = (id: Id) => kusyAleboBalenia.uzly.find((u) => u.id === id)!;
  const textUzla = (id: Id) => JSON.stringify(najdi(id));

  it('konštanty sedia so zadaním', () => {
    expect(POZADOVANE_KUSY / KUSOV_V_BALENI).toBe(3);
    expect(3 * CENA_BALENIA).toBe(252);
    expect(18 * KUSOV_V_BALENI).toBe(108);
    expect(18 * CENA_BALENIA).toBe(1512);
    expect(CENA_BALENIA / KUSOV_V_BALENI).toBe(14);
    expect(NAKLAD_OPRAVY).toBe(45);
  });

  it('rekapitulácie v texte zodpovedajú výpočtom', () => {
    expect(textUzla('s2-rekap-3')).toContain('"3 bal"');
    expect(textUzla('s2-rekap-3')).toContain('"18 ks"');
    expect(textUzla('s2-rekap-3')).toContain('"252 €"');
    expect(textUzla('s2-rekap-oprava')).toContain('"252 €"');
    expect(textUzla('s2-rekap-18')).toContain('"18 bal"');
    expect(textUzla('s2-rekap-18')).toContain('"108 ks"');
    expect(textUzla('s2-rekap-18')).toContain('"1 512 €"');
  });

  it('chybný záver rozlišuje náklad na dopravu od ceny objednávky', () => {
    const koniec = najdi('s2-koniec-expedicia');
    const text = JSON.stringify(koniec);
    expect(text).toContain('45 €');
    expect(text).toContain('1 512 €');
    expect(text).toContain('to nie je strata');
    expect(text).toContain('90 × 14 € = 1 260 €');
  });
});

describe('scenár Zmena adresy: viac správnych poradí', () => {
  it('overenie aj zastavenie ako prvý krok vedú k bezchybnému záveru', () => {
    const prve = ['s3-start-overit', 's3-start-zastavit'];
    for (const prva of prve) {
      const cesty = vsetkyCesty(zmenaAdresy).filter((c) => c.cesta[0]?.moznost === prva);
      expect(cesty.some((c) => c.verdikt === 'zvladnute')).toBe(true);
    }
  });

  it('prepísanie hlavičky bez štítku nevedie k správnemu záveru bez opravy', () => {
    const scenar = zmenaAdresy;
    const p = vyberMoznost(scenar, novyPokus(scenar), 's3-start-hlavicka');
    const v = vyhodnot(scenar, p);
    expect(v.body.find((b) => b.id === 's3-kb-expedicia')?.stav).toBe('nevyriesene');
    expect(v.body.find((b) => b.id === 's3-kb-potvrdenie')?.stav).toBe('nevyriesene');
  });
});

describe('scenár Sľúbený termín: prísľub bez kontroly má viditeľný následok', () => {
  it('pri prvom rozhodnutí nie je skladový prehľad označený ako dôležitý (pasca ako v praxi)', () => {
    const start = slubenyTermin.uzly.find((u) => u.id === slubenyTermin.vstupnyUzol);
    expect(start?.typ === 'rozhodnutie' && start.podklady).toEqual(['s1-email']);
  });

  it('rovno potvrdený termín vedie do spätnej väzby, nie na hlavnú cestu', () => {
    const p = vyberMoznost(slubenyTermin, novyPokus(slubenyTermin), 's1-start-potvrdit');
    expect(p.aktualnyUzol).toBe('s1-slub-bez-kontroly');
    const uzol = slubenyTermin.uzly.find((u) => u.id === p.aktualnyUzol);
    expect(uzol?.typ === 'rozhodnutie' && uzol.spatnaVazba).toBe(true);
  });

  it('expresné riešenie stojí 120 € a končí chybou', () => {
    let p = vyberMoznost(slubenyTermin, novyPokus(slubenyTermin), 's1-start-potvrdit');
    p = vyberMoznost(slubenyTermin, p, 's1-slub-express');
    const v = vyhodnot(slubenyTermin, p);
    expect(v.naklad).toBe(120);
    expect(v.verdikt).toBe('chyba');
  });
});
