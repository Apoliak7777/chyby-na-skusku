import { describe, expect, it } from 'vitest';
import type { Scenar } from '../data/types';
import { trening } from '../data/demo';
import { validujScenar, validujTrening, zhrnNalezy } from './validacia';

function zakladnyScenar(): Scenar {
  return {
    id: 'test',
    verzia: '1',
    nazov: 'Test',
    strucnyProblem: 'p',
    pozicia: 'p',
    cvici: 'c',
    zadanie: ['z'],
    podklady: [{ id: 'pk', nazov: 'Podklad', druh: 'ine', bloky: [{ typ: 'text', text: ['x'] }] }],
    kontrolneBody: [
      { id: 'kb1', nazov: 'KB1', vysvetlenie: '', zdrojPravidla: '' },
      { id: 'kb2', nazov: 'KB2', vysvetlenie: '', zdrojPravidla: '' },
    ],
    vstupnyUzol: 'a',
    uzly: [
      {
        id: 'a',
        typ: 'rozhodnutie',
        nadpis: 'A',
        pribeh: [{ typ: 'podklad', podklad: 'pk' }],
        uloha: '?',
        moznosti: [
          { id: 'a1', text: 'ok', dalsi: 'b', ucinky: { kb1: 'splnene' } },
          { id: 'a2', text: 'zle', dalsi: 'zle', ucinky: { kb1: 'nesplnene' }, naklad: 10 },
        ],
      },
      {
        id: 'b',
        typ: 'rozhodnutie',
        nadpis: 'B',
        pribeh: [],
        uloha: '?',
        moznosti: [
          { id: 'b1', text: 'ok', dalsi: 'ok', ucinky: { kb2: 'splnene' } },
          { id: 'b2', text: 'zle', dalsi: 'zle', ucinky: { kb2: 'nesplnene' } },
        ],
      },
      { id: 'ok', typ: 'zaver', nadpis: 'OK', vysledok: 'spravne', pribeh: [], vysvetlenie: ['v'] },
      { id: 'zle', typ: 'zaver', nadpis: 'Zle', vysledok: 'chyba', pribeh: [], vysvetlenie: ['v'] },
    ],
    schvalenie: { stav: 'schvalene', verziaPravidiel: '1', podklad: 'test' },
  };
}

const chyby = (s: Scenar) =>
  validujScenar(s)
    .filter((n) => n.uroven === 'chyba')
    .map((n) => `${n.kde ?? ''}: ${n.sprava}`);

describe('validácia demo tréningu', () => {
  it('všetky tri demo scenáre prejdú bez chýb a bez upozornení', () => {
    const nalezy = validujTrening(trening);
    const { chyby: pocetChyb, upozornenia } = zhrnNalezy(nalezy);
    expect(nalezy.map((n) => `${n.uroven}: ${n.scenar} ${n.kde ?? ''} ${n.sprava}`)).toEqual([]);
    expect(pocetChyb).toBe(0);
    expect(upozornenia).toBe(0);
  });

  it('základný testovací scenár je platný', () => {
    expect(validujScenar(zakladnyScenar())).toEqual([]);
  });
});

describe('validácia odhalí chyby', () => {
  it('neexistujúci cieľový uzol', () => {
    const s = zakladnyScenar();
    (s.uzly[0] as { moznosti: { dalsi: string }[] }).moznosti[0]!.dalsi = 'nikde';
    expect(chyby(s).join('\n')).toMatch(/Cieľový uzol „nikde“ neexistuje/);
  });

  it('duplicitné ID uzla a možnosti', () => {
    const s = zakladnyScenar();
    s.uzly.push({ ...s.uzly[2]!, id: 'a' });
    (s.uzly[1] as { moznosti: { id: string }[] }).moznosti[0]!.id = 'a1';
    const c = chyby(s).join('\n');
    expect(c).toMatch(/Duplicitné ID uzla „a“/);
    expect(c).toMatch(/Duplicitné ID možnosti „a1“/);
  });

  it('cyklus v grafe', () => {
    const s = zakladnyScenar();
    (s.uzly[1] as { moznosti: { dalsi: string }[] }).moznosti[1]!.dalsi = 'a';
    expect(chyby(s).join('\n')).toMatch(/cyklus/);
  });

  it('uzol, z ktorého sa nedá dostať k záveru', () => {
    const s = zakladnyScenar();
    // Odstránime závery a nahradíme ich slučkou bez konca – najprv cyklus, tak radšej: uzol bez možností.
    s.uzly.push({ id: 'slepy', typ: 'rozhodnutie', nadpis: 'S', pribeh: [], uloha: '?', moznosti: [] });
    (s.uzly[1] as { moznosti: { dalsi: string }[] }).moznosti[1]!.dalsi = 'slepy';
    expect(chyby(s).join('\n')).toMatch(/nemá žiadnu možnosť/);
  });

  it('chýba bezchybná cesta', () => {
    const s = zakladnyScenar();
    // kb2 sa dá splniť len po nesplnení: b1 najprv nesplní, potom nikde nesplní na prvý pokus.
    (s.uzly[1] as { moznosti: { ucinky?: Record<string, 'splnene' | 'nesplnene'> }[] }).moznosti[0]!.ucinky = { kb2: 'nesplnene' };
    (s.uzly[1] as { moznosti: { ucinky?: Record<string, 'splnene' | 'nesplnene'> }[] }).moznosti[1]!.ucinky = { kb2: 'splnene' };
    // b2 vedie do „zle“, takže správny záver so všetkými bodmi neexistuje.
    expect(chyby(s).join('\n')).toMatch(/Neexistuje cesta/);
  });

  it('kontrolný bod bez splňujúcej možnosti', () => {
    const s = zakladnyScenar();
    s.kontrolneBody.push({ id: 'kb3', nazov: 'KB3', vysvetlenie: '', zdrojPravidla: '' });
    expect(chyby(s).join('\n')).toMatch(/kontrolný bod kb3/i);
  });

  it('účinok na neexistujúci kontrolný bod', () => {
    const s = zakladnyScenar();
    (s.uzly[0] as { moznosti: { ucinky?: Record<string, 'splnene'> }[] }).moznosti[0]!.ucinky = { kbX: 'splnene' };
    expect(chyby(s).join('\n')).toMatch(/neexistujúci kontrolný bod „kbX“/);
  });

  it('príbeh odkazuje na neexistujúci podklad', () => {
    const s = zakladnyScenar();
    s.uzly[0]!.pribeh = [{ typ: 'podklad', podklad: 'nic' }];
    expect(chyby(s).join('\n')).toMatch(/neexistujúci podklad „nic“/);
  });

  it('číselný vstup bez záchytnej možnosti', () => {
    const s = zakladnyScenar();
    const a = s.uzly[0];
    if (!a || a.typ !== 'rozhodnutie') throw new Error();
    a.vstup = { popis: 'x', jednotka: 'ks', min: 1, max: 5 };
    a.moznosti[0]!.hodnoty = [1];
    a.moznosti[1]!.hodnoty = [2];
    expect(chyby(s).join('\n')).toMatch(/záchytnú možnosť/);
  });

  it('hodnoty bez číselného vstupu a náklad záporný', () => {
    const s = zakladnyScenar();
    const a = s.uzly[0];
    if (!a || a.typ !== 'rozhodnutie') throw new Error();
    a.moznosti[0]!.hodnoty = [1];
    a.moznosti[1]!.naklad = -5;
    const c = chyby(s).join('\n');
    expect(c).toMatch(/nemá číselný vstup/);
    expect(c).toMatch(/nezáporné číslo/);
  });

  it('viac než 4 možnosti', () => {
    const s = zakladnyScenar();
    const a = s.uzly[0];
    if (!a || a.typ !== 'rozhodnutie') throw new Error();
    for (let i = 0; i < 3; i++) a.moznosti.push({ id: `x${i}`, text: 'x', dalsi: 'ok' });
    expect(chyby(s).join('\n')).toMatch(/najviac 4/);
  });
});

describe('validácia upozorní', () => {
  it('na nedosiahnuteľný uzol a správny záver s nákladom', () => {
    const s = zakladnyScenar();
    s.uzly.push({ id: 'sirota', typ: 'zaver', nadpis: 'S', vysledok: 'komplikacia', pribeh: [], vysvetlenie: ['v'] });
    (s.uzly[0] as { moznosti: { naklad?: number }[] }).moznosti[0]!.naklad = 5;
    const upozornenia = validujScenar(s).filter((n) => n.uroven === 'upozornenie').map((n) => n.sprava).join('\n');
    expect(upozornenia).toMatch(/nie je dosiahnuteľný/);
    expect(upozornenia).toMatch(/modelovým nákladom 5 €/);
  });
});
