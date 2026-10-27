import { describe, expect, it } from 'vitest';
import { MAX_PORADIE, TRIEDA_ODHALENE, TRIEDA_POHYB, sledujOdhalenie, smiePohyb, zapniPohyb, type OknoPohybu, type ZdrojFokusu } from './pohyb';

/** Testy bežia v Node bez DOM: prvky, okno a IntersectionObserver sú jednoduché náhrady. */

class Triedy {
  private mnozina = new Set<string>();
  add(...t: string[]) {
    for (const x of t) this.mnozina.add(x);
  }
  remove(...t: string[]) {
    for (const x of t) this.mnozina.delete(x);
  }
  contains(t: string) {
    return this.mnozina.has(t);
  }
}

interface NahradaPrvku {
  classList: Triedy;
  style: { hodnoty: Map<string, string>; setProperty: (n: string, h: string) => void };
  closest: (selektor: string) => NahradaPrvku | null;
}

function prvok(): NahradaPrvku {
  const hodnoty = new Map<string, string>();
  const p: NahradaPrvku = {
    classList: new Triedy(),
    style: { hodnoty, setProperty: (n, h) => void hodnoty.set(n, h) },
    closest: (selektor) => (selektor === '[data-odhal]' ? p : null),
  };
  return p;
}

const html = (p: NahradaPrvku) => p as unknown as HTMLElement;

/** Náhrada IntersectionObserver: zapamätá si spätné volanie a sledované prvky. */
function nahradaPozorovatela() {
  const stav = {
    spatne: null as IntersectionObserverCallback | null,
    moznosti: undefined as IntersectionObserverInit | undefined,
    sledovane: new Set<unknown>(),
    odpojeny: false,
  };
  class Pozorovatel {
    constructor(spatne: IntersectionObserverCallback, moznosti?: IntersectionObserverInit) {
      stav.spatne = spatne;
      stav.moznosti = moznosti;
    }
    observe(p: unknown) {
      stav.sledovane.add(p);
    }
    unobserve(p: unknown) {
      stav.sledovane.delete(p);
    }
    disconnect() {
      stav.odpojeny = true;
      stav.sledovane.clear();
    }
  }
  const posli = (zaznamy: { prvok: NahradaPrvku; vidno: boolean; spodok?: number }[]) =>
    stav.spatne?.(
      zaznamy.map((z) => ({ target: z.prvok, isIntersecting: z.vidno, boundingClientRect: { bottom: z.spodok ?? 300 } })) as unknown as IntersectionObserverEntry[],
      {} as IntersectionObserver,
    );
  return { stav, posli, trieda: Pozorovatel as unknown as typeof IntersectionObserver };
}

function okno(pohyb: boolean, pozorovatel?: typeof IntersectionObserver) {
  const posluchaci: (() => void)[] = [];
  const dotaz = {
    matches: pohyb,
    addEventListener: (_typ: 'change', p: () => void) => void posluchaci.push(p),
  };
  const o: OknoPohybu = { matchMedia: () => dotaz, IntersectionObserver: pozorovatel };
  const zmen = (nove: boolean) => {
    dotaz.matches = nove;
    for (const p of posluchaci) p();
  };
  return { o, zmen };
}

describe('pohyb: kedy sa zapne', () => {
  it('len s IntersectionObserver a bez obmedzenia pohybu', () => {
    const { trieda } = nahradaPozorovatela();
    expect(smiePohyb(okno(true, trieda).o)).toBe(true);
    expect(smiePohyb(okno(false, trieda).o)).toBe(false);
    expect(smiePohyb(okno(true).o)).toBe(false);
    expect(smiePohyb({})).toBe(false);
  });

  it('trieda na koreni zmizne, keď si návštevník počas návštevy zapne obmedzenie pohybu', () => {
    const { trieda } = nahradaPozorovatela();
    const koren = { classList: new Triedy() };
    const { o, zmen } = okno(true, trieda);
    zapniPohyb(koren as unknown as HTMLElement, o);
    expect(koren.classList.contains(TRIEDA_POHYB)).toBe(true);
    zmen(false);
    expect(koren.classList.contains(TRIEDA_POHYB)).toBe(false);
  });

  it('pri obmedzenom pohybe triedu nepridá, takže CSS nič neskryje', () => {
    const { trieda } = nahradaPozorovatela();
    const koren = { classList: new Triedy() };
    zapniPohyb(koren as unknown as HTMLElement, okno(false, trieda).o);
    expect(koren.classList.contains(TRIEDA_POHYB)).toBe(false);
  });
});

describe('pohyb: odhalenie pri scrollovaní', () => {
  it('odhalí prvok raz, keď je v okne, a prestane ho sledovať', () => {
    const { stav, posli, trieda } = nahradaPozorovatela();
    const [a, b] = [prvok(), prvok()];
    sledujOdhalenie([html(a), html(b)], okno(true, trieda).o);
    expect(stav.moznosti?.rootMargin).toMatch(/^\d+px 0px -\d+% 0px$/);
    expect(stav.sledovane.size).toBe(2);

    posli([
      { prvok: a, vidno: true },
      { prvok: b, vidno: false },
    ]);
    expect(a.classList.contains(TRIEDA_ODHALENE)).toBe(true);
    expect(b.classList.contains(TRIEDA_ODHALENE)).toBe(false);
    expect(stav.sledovane.has(a)).toBe(false);
    expect(stav.sledovane.has(b)).toBe(true);

    // Opakovaný záznam pre už odhalený prvok nič nezmení (napr. po návrate scrollom).
    a.style.hodnoty.set('--poradie', 'x');
    posli([{ prvok: a, vidno: true }]);
    expect(a.style.hodnoty.get('--poradie')).toBe('x');
  });

  it('prvky odhalené naraz idú v sérii, s obmedzeným poradím; prvok nad oknom nečaká', () => {
    const { posli, trieda } = nahradaPozorovatela();
    const nad = prvok();
    const vRade = Array.from({ length: MAX_PORADIE + 3 }, () => prvok());
    sledujOdhalenie([nad, ...vRade].map(html), okno(true, trieda).o);
    posli([{ prvok: nad, vidno: true, spodok: -40 }, ...vRade.map((p) => ({ prvok: p, vidno: true }))]);
    expect(nad.style.hodnoty.get('--poradie')).toBe('0');
    expect(vRade.map((p) => Number(p.style.hodnoty.get('--poradie')))).toEqual([0, 1, 2, 3, 4, 4, 4]);
  });

  it('prvok schovaný pod lepkavou hlavičkou nečaká a nezaberie miesto v sérii (skok na kotvu)', () => {
    const { posli, trieda } = nahradaPozorovatela();
    const podHlavickou = prvok();
    const ciel = prvok();
    sledujOdhalenie([podHlavickou, ciel].map(html), okno(true, trieda).o, undefined, 64);
    posli([
      { prvok: podHlavickou, vidno: true, spodok: 30 },
      { prvok: ciel, vidno: true },
    ]);
    expect(podHlavickou.style.hodnoty.get('--poradie')).toBe('0');
    expect(ciel.style.hodnoty.get('--poradie')).toBe('0');
  });

  it('fokus v skrytom prvku ho odhalí hneď a upratanie odpojí pozorovateľa aj posluchača', () => {
    const { stav, trieda } = nahradaPozorovatela();
    const p = prvok();
    const zachyteny: { posluchac: ((e: Event) => void) | null } = { posluchac: null };
    const fokus: ZdrojFokusu = {
      addEventListener: (_t, f) => void (zachyteny.posluchac = f),
      removeEventListener: (_t, f) => {
        if (zachyteny.posluchac === f) zachyteny.posluchac = null;
      },
    };
    const uprac = sledujOdhalenie([html(p)], okno(true, trieda).o, fokus);
    expect(zachyteny.posluchac).not.toBeNull();
    zachyteny.posluchac?.({ target: p } as unknown as Event);
    expect(p.classList.contains(TRIEDA_ODHALENE)).toBe(true);
    expect(stav.sledovane.has(p)).toBe(false);
    uprac();
    expect(stav.odpojeny).toBe(true);
    expect(zachyteny.posluchac).toBeNull();
  });

  it('bez IntersectionObserver alebo pri jeho chybe je všetko odhalené hneď', () => {
    const [a, b] = [prvok(), prvok()];
    sledujOdhalenie([html(a), html(b)], okno(true).o);
    expect([a, b].every((p) => p.classList.contains(TRIEDA_ODHALENE))).toBe(true);

    const c = prvok();
    const Chybny = class {
      constructor() {
        throw new Error('nepodporované');
      }
    } as unknown as typeof IntersectionObserver;
    sledujOdhalenie([html(c)], okno(true, Chybny).o);
    expect(c.classList.contains(TRIEDA_ODHALENE)).toBe(true);
  });
});
