import { describe, expect, it } from 'vitest';
import type { Scenar } from '../data/types';
import { kusyAleboBalenia } from '../data/demo/scenar2_kusy_alebo_balenia';
import {
  jeDokonceny,
  moznostPodlaHodnoty,
  novyPokus,
  textMoznosti,
  vratSaKuKroku,
  vyberMoznost,
  vyhodnot,
  zadajHodnotu,
} from './pokus';

/** Malý syntetický scenár na overenie semantiky enginu nezávisle od demo obsahu. */
const mini: Scenar = {
  id: 'mini',
  verzia: '1',
  nazov: 'Mini',
  strucnyProblem: 'test',
  pozicia: 'test',
  cvici: 'test',
  zadanie: ['test'],
  podklady: [],
  kontrolneBody: [
    { id: 'kb-a', nazov: 'A', vysvetlenie: '', zdrojPravidla: '' },
    { id: 'kb-b', nazov: 'B', vysvetlenie: '', zdrojPravidla: '' },
  ],
  vstupnyUzol: 'start',
  uzly: [
    {
      id: 'start',
      typ: 'rozhodnutie',
      nadpis: 'Štart',
      pribeh: [],
      uloha: '?',
      moznosti: [
        { id: 'a-ok', text: 'A správne', dalsi: 'mid', ucinky: { 'kb-a': 'splnene' } },
        { id: 'a-bad', text: 'A chybne', dalsi: 'fb', ucinky: { 'kb-a': 'nesplnene' } },
      ],
    },
    {
      id: 'fb',
      typ: 'rozhodnutie',
      spatnaVazba: true,
      nadpis: 'Spätná väzba',
      pribeh: [],
      uloha: '?',
      moznosti: [
        { id: 'fix', text: 'Opraviť', dalsi: 'mid', ucinky: { 'kb-a': 'splnene' } },
        { id: 'give-up', text: 'Vzdať to', dalsi: 'end-bad', naklad: 50 },
      ],
    },
    {
      id: 'mid',
      typ: 'rozhodnutie',
      nadpis: 'Stred',
      pribeh: [],
      uloha: '?',
      moznosti: [
        { id: 'b-ok', text: 'B správne', dalsi: 'end-ok', ucinky: { 'kb-b': 'splnene' } },
        { id: 'b-bad', text: 'B chybne', dalsi: 'end-bad', ucinky: { 'kb-b': 'nesplnene' }, naklad: 30 },
      ],
    },
    { id: 'end-ok', typ: 'zaver', nadpis: 'OK', vysledok: 'spravne', pribeh: [], vysvetlenie: ['x'] },
    { id: 'end-bad', typ: 'zaver', nadpis: 'Zle', vysledok: 'chyba', pribeh: [], vysvetlenie: ['y'] },
  ],
  schvalenie: { stav: 'schvalene', verziaPravidiel: '1', podklad: 'test' },
};

describe('nový pokus', () => {
  it('začína s čistým stavom', () => {
    const p = novyPokus(mini, 0);
    expect(p.kroky).toEqual([]);
    expect(p.aktualnyUzol).toBe('start');
    const v = vyhodnot(mini, p);
    expect(v.dokonceny).toBe(false);
    expect(v.verdikt).toBe('rozpracovane');
    expect(v.naklad).toBe(0);
    expect(v.body.map((b) => b.stav)).toEqual(['otvorene', 'otvorene']);
  });
});

describe('výber možnosti', () => {
  it('odmietne neznámu možnosť', () => {
    expect(() => vyberMoznost(mini, novyPokus(mini), 'neexistuje')).toThrow(/nepatrí/);
  });

  it('odmietne ďalšie rozhodnutie po závere', () => {
    let p = novyPokus(mini);
    p = vyberMoznost(mini, p, 'a-ok');
    p = vyberMoznost(mini, p, 'b-ok');
    expect(jeDokonceny(mini, p)).toBe(true);
    expect(() => vyberMoznost(mini, p, 'b-ok')).toThrow(/dokončený/);
  });

  it('správna cesta: všetko správne na prvý pokus, bez nákladu', () => {
    let p = novyPokus(mini);
    p = vyberMoznost(mini, p, 'a-ok');
    p = vyberMoznost(mini, p, 'b-ok');
    const v = vyhodnot(mini, p);
    expect(v.dokonceny).toBe(true);
    expect(v.verdikt).toBe('zvladnute');
    expect(v.zaver?.id).toBe('end-ok');
    expect(v.body.map((b) => b.stav)).toEqual(['spravne', 'spravne']);
    expect(v.naklad).toBe(0);
    expect(v.cesta.map((c) => c.moznost)).toEqual(['a-ok', 'b-ok']);
  });

  it('oprava po spätnej väzbe sa označí ako opravené', () => {
    let p = novyPokus(mini);
    p = vyberMoznost(mini, p, 'a-bad');
    p = vyberMoznost(mini, p, 'fix');
    p = vyberMoznost(mini, p, 'b-ok');
    const v = vyhodnot(mini, p);
    expect(v.verdikt).toBe('zvladnute-po-oprave');
    expect(v.body.find((b) => b.id === 'kb-a')?.stav).toBe('opravene');
    expect(v.body.find((b) => b.id === 'kb-b')?.stav).toBe('spravne');
    expect(v.pocty).toEqual({ spravne: 1, opravene: 1, nevyriesene: 0, otvorene: 0 });
  });

  it('chybný záver: náklad len na vetve, ktorá k nemu vedie; nedotknuté body sú nevyriešené', () => {
    let p = novyPokus(mini);
    p = vyberMoznost(mini, p, 'a-bad');
    p = vyberMoznost(mini, p, 'give-up');
    const v = vyhodnot(mini, p);
    expect(v.verdikt).toBe('chyba');
    expect(v.naklad).toBe(50);
    expect(v.body.map((b) => b.stav)).toEqual(['nevyriesene', 'nevyriesene']);
  });
});

describe('návrat ku kroku', () => {
  it('odstráni nasledujúcu vetvu vrátane nákladov a stavov bodov', () => {
    let p = novyPokus(mini);
    p = vyberMoznost(mini, p, 'a-ok');
    p = vyberMoznost(mini, p, 'b-bad');
    expect(vyhodnot(mini, p).naklad).toBe(30);

    p = vratSaKuKroku(mini, p, 1);
    expect(p.aktualnyUzol).toBe('mid');
    expect(p.kroky).toHaveLength(1);
    const v = vyhodnot(mini, p);
    expect(v.naklad).toBe(0);
    expect(v.dokonceny).toBe(false);
    expect(v.body.find((b) => b.id === 'kb-b')?.stav).toBe('otvorene');

    p = vyberMoznost(mini, p, 'b-ok');
    const v2 = vyhodnot(mini, p);
    expect(v2.naklad).toBe(0);
    expect(v2.verdikt).toBe('zvladnute');
  });

  it('návrat na začiatok zmaže celú cestu', () => {
    let p = novyPokus(mini);
    p = vyberMoznost(mini, p, 'a-bad');
    p = vyberMoznost(mini, p, 'give-up');
    p = vratSaKuKroku(mini, p, 0);
    expect(p.kroky).toEqual([]);
    expect(p.aktualnyUzol).toBe('start');
    expect(vyhodnot(mini, p).naklad).toBe(0);
  });

  it('náklad sa po návrate a novom výbere nezdvojí', () => {
    let p = novyPokus(mini);
    p = vyberMoznost(mini, p, 'a-bad');
    p = vyberMoznost(mini, p, 'give-up'); // 50
    p = vratSaKuKroku(mini, p, 1);
    p = vyberMoznost(mini, p, 'give-up'); // znova 50, nie 100
    expect(vyhodnot(mini, p).naklad).toBe(50);
  });

  it('odmietne neexistujúci krok', () => {
    expect(() => vratSaKuKroku(mini, novyPokus(mini), 0)).toThrow(/neexistuje/);
  });

  it('nový pokus po dokončení začína odznova', () => {
    let p = novyPokus(mini);
    p = vyberMoznost(mini, p, 'a-bad');
    p = vyberMoznost(mini, p, 'give-up');
    const novy = novyPokus(mini);
    expect(novy.kroky).toEqual([]);
    expect(vyhodnot(mini, novy).naklad).toBe(0);
  });
});

describe('číselný vstup (scenár Kusy alebo balenia)', () => {
  const scenar = kusyAleboBalenia;
  const naKartu = () => vyberMoznost(scenar, novyPokus(scenar), 's2-start-karta');

  it('3 balenia vedú na správnu rekapituláciu', () => {
    const p = zadajHodnotu(scenar, naKartu(), 3);
    expect(p.aktualnyUzol).toBe('s2-rekap-3');
    expect(p.kroky[1]?.hodnota).toBe(3);
    expect(vyhodnot(scenar, p).cesta[1]?.text).toBe('Zadané množstvo: 3 bal');
  });

  it('18 balení vedie na rekapituláciu so 108 kusmi', () => {
    const p = zadajHodnotu(scenar, naKartu(), 18);
    expect(p.aktualnyUzol).toBe('s2-rekap-18');
  });

  it('iné hodnoty idú na záchytnú možnosť', () => {
    expect(zadajHodnotu(scenar, naKartu(), 7).aktualnyUzol).toBe('s2-rekap-ine');
    expect(zadajHodnotu(scenar, naKartu(), 1).aktualnyUzol).toBe('s2-rekap-ine');
  });

  it('hodnoty mimo rozsahu sa odmietnu', () => {
    expect(() => zadajHodnotu(scenar, naKartu(), 0)).toThrow(/od 1 do 99/);
    expect(() => zadajHodnotu(scenar, naKartu(), 100)).toThrow(/od 1 do 99/);
    expect(() => zadajHodnotu(scenar, naKartu(), Number.NaN)).toThrow();
  });

  it('zadanie hodnoty mimo uzla so vstupom je chyba', () => {
    expect(() => zadajHodnotu(scenar, novyPokus(scenar), 3)).toThrow(/nemá číselný vstup/);
  });

  it('moznostPodlaHodnoty a textMoznosti', () => {
    const uzol = scenar.uzly.find((u) => u.id === 's2-karta');
    if (!uzol || uzol.typ !== 'rozhodnutie') throw new Error('chýba uzol');
    expect(moznostPodlaHodnoty(uzol, 3)?.id).toBe('s2-karta-3');
    expect(moznostPodlaHodnoty(uzol, 42)?.id).toBe('s2-karta-ine');
    const m = uzol.moznosti[0]!;
    expect(textMoznosti(m, 3)).toBe('Zadané množstvo: 3 bal');
    expect(textMoznosti(m)).toBe('Zadané množstvo: … bal');
  });
});
