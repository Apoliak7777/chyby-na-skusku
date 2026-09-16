import type {
  Id,
  KontrolnyBod,
  Moznost,
  RozhodovaciUzol,
  Scenar,
  UcinokKB,
  Uzol,
  ZaverecnyUzol,
} from '../data/types';

/**
 * Stav jedného pokusu o scenár a jeho vyhodnotenie.
 *
 * Všetko sú čisté funkcie nad nemennými dátami: pokus sa nikdy neupravuje na mieste,
 * vždy vzniká nový objekt. Vďaka tomu je návrat ku kroku len orezanie zoznamu krokov
 * a náklady ani kontrolné body sa nemôžu započítať dvakrát – počítajú sa vždy nanovo
 * z aktuálnej cesty.
 */

export interface Krok {
  uzol: Id;
  moznost: Id;
  /** Zadaná hodnota pri uzle s číselným vstupom. */
  hodnota?: number;
}

export interface Pokus {
  scenar: Id;
  kroky: Krok[];
  aktualnyUzol: Id;
  /** Čas začiatku (ms), len na zobrazenie. */
  zacaty: number;
}

export function najdiUzol(scenar: Scenar, id: Id): Uzol {
  const uzol = scenar.uzly.find((u) => u.id === id);
  if (!uzol) {
    throw new Error(`Uzol „${id}“ v scenári „${scenar.id}“ neexistuje.`);
  }
  return uzol;
}

export function novyPokus(scenar: Scenar, cas: number = Date.now()): Pokus {
  return { scenar: scenar.id, kroky: [], aktualnyUzol: scenar.vstupnyUzol, zacaty: cas };
}

export function aktualnyUzol(scenar: Scenar, pokus: Pokus): Uzol {
  return najdiUzol(scenar, pokus.aktualnyUzol);
}

export function jeDokonceny(scenar: Scenar, pokus: Pokus): boolean {
  return aktualnyUzol(scenar, pokus).typ === 'zaver';
}

/** Pri uzle s číselným vstupom vyberie možnosť podľa zadanej hodnoty. */
export function moznostPodlaHodnoty(uzol: RozhodovaciUzol, hodnota: number): Moznost | undefined {
  const presna = uzol.moznosti.find((m) => m.hodnoty?.includes(hodnota));
  return presna ?? uzol.moznosti.find((m) => m.ostatneHodnoty);
}

export function vyberMoznost(scenar: Scenar, pokus: Pokus, moznostId: Id, hodnota?: number): Pokus {
  const uzol = aktualnyUzol(scenar, pokus);
  if (uzol.typ !== 'rozhodnutie') {
    throw new Error('Scenár je dokončený, ďalšie rozhodnutie nie je možné.');
  }
  const moznost = uzol.moznosti.find((m) => m.id === moznostId);
  if (!moznost) {
    throw new Error(`Možnosť „${moznostId}“ nepatrí k uzlu „${uzol.id}“.`);
  }
  // Cieľ musí existovať skôr, ako naň prejdeme.
  najdiUzol(scenar, moznost.dalsi);
  const krok: Krok = hodnota === undefined ? { uzol: uzol.id, moznost: moznost.id } : { uzol: uzol.id, moznost: moznost.id, hodnota };
  return { ...pokus, kroky: [...pokus.kroky, krok], aktualnyUzol: moznost.dalsi };
}

/** Zadanie čísla pri uzle s číselným vstupom. Vyhodí chybu pri hodnote mimo rozsahu. */
export function zadajHodnotu(scenar: Scenar, pokus: Pokus, hodnota: number): Pokus {
  const uzol = aktualnyUzol(scenar, pokus);
  if (uzol.typ !== 'rozhodnutie' || !uzol.vstup) {
    throw new Error(`Uzol „${uzol.id}“ nemá číselný vstup.`);
  }
  const { min, max } = uzol.vstup;
  if (!Number.isFinite(hodnota) || hodnota < min || hodnota > max) {
    throw new Error(`Zadajte číslo od ${min} do ${max}.`);
  }
  const moznost = moznostPodlaHodnoty(uzol, hodnota);
  if (!moznost) {
    throw new Error(`Pre hodnotu ${hodnota} nie je v uzle „${uzol.id}“ žiadna možnosť.`);
  }
  return vyberMoznost(scenar, pokus, moznost.id, hodnota);
}

/**
 * Návrat ku kroku s poradovým číslom `index` (od 0). Krok aj všetko po ňom sa z pokusu
 * odstráni a používateľ rozhoduje v tom istom uzle znova.
 */
export function vratSaKuKroku(scenar: Scenar, pokus: Pokus, index: number): Pokus {
  const krok = pokus.kroky[index];
  if (!krok) {
    throw new Error(`Krok č. ${index + 1} v pokuse neexistuje.`);
  }
  najdiUzol(scenar, krok.uzol);
  return { ...pokus, kroky: pokus.kroky.slice(0, index), aktualnyUzol: krok.uzol };
}

export function textMoznosti(moznost: Moznost, hodnota?: number): string {
  return moznost.text.replace('{hodnota}', hodnota === undefined ? '…' : String(hodnota));
}

/* ---------- Vyhodnotenie ---------- */

export type StavKB = 'spravne' | 'opravene' | 'nevyriesene' | 'otvorene';

export interface VyhodnotenyKB extends KontrolnyBod {
  stav: StavKB;
}

export interface ZaznamCesty {
  poradie: number;
  uzol: Id;
  nadpisUzla: string;
  moznost: Id;
  text: string;
  nasledok?: string;
  naklad?: number;
  hodnota?: number;
}

export type Verdikt = 'zvladnute' | 'zvladnute-po-oprave' | 's-vyhradami' | 'komplikacia' | 'chyba' | 'rozpracovane';

export interface Vyhodnotenie {
  dokonceny: boolean;
  zaver?: ZaverecnyUzol;
  verdikt: Verdikt;
  body: VyhodnotenyKB[];
  /** Súčet modelových nákladov na aktuálnej ceste. */
  naklad: number;
  cesta: ZaznamCesty[];
  pocty: Record<StavKB, number>;
}

export const POPIS_STAVU_KB: Record<StavKB, { text: string; znak: string }> = {
  spravne: { text: 'správne na prvý pokus', znak: '✔' },
  opravene: { text: 'opravené po spätnej väzbe', znak: '↻' },
  nevyriesene: { text: 'nevyriešené', znak: '✖' },
  otvorene: { text: 'zatiaľ neposúdené', znak: '·' },
};

export const POPIS_VERDIKTU: Record<Verdikt, { nadpis: string; znak: string }> = {
  zvladnute: { nadpis: 'Zvládnuté', znak: '✔' },
  'zvladnute-po-oprave': { nadpis: 'Zvládnuté po oprave', znak: '↻' },
  's-vyhradami': { nadpis: 'Dokončené s výhradami', znak: '!' },
  komplikacia: { nadpis: 'Dokončené s komplikáciou', znak: '!' },
  chyba: { nadpis: 'Chyba s následkom', znak: '✖' },
  rozpracovane: { nadpis: 'Rozpracované', znak: '…' },
};

export function vyhodnot(scenar: Scenar, pokus: Pokus): Vyhodnotenie {
  const stavy = new Map<Id, { posledny?: UcinokKB; boloNesplnene: boolean }>();
  for (const kb of scenar.kontrolneBody) {
    stavy.set(kb.id, { boloNesplnene: false });
  }

  let naklad = 0;
  const cesta: ZaznamCesty[] = [];

  pokus.kroky.forEach((krok, i) => {
    const uzol = najdiUzol(scenar, krok.uzol);
    if (uzol.typ !== 'rozhodnutie') {
      throw new Error(`Krok č. ${i + 1} odkazuje na záverečný uzol „${uzol.id}“.`);
    }
    const moznost = uzol.moznosti.find((m) => m.id === krok.moznost);
    if (!moznost) {
      throw new Error(`Krok č. ${i + 1}: možnosť „${krok.moznost}“ v uzle „${uzol.id}“ neexistuje.`);
    }
    if (moznost.naklad) {
      naklad += moznost.naklad;
    }
    for (const [kbId, ucinok] of Object.entries(moznost.ucinky ?? {})) {
      const stav = stavy.get(kbId);
      if (!stav) continue;
      if (ucinok === 'nesplnene') stav.boloNesplnene = true;
      stav.posledny = ucinok;
    }
    const zaznam: ZaznamCesty = {
      poradie: i + 1,
      uzol: uzol.id,
      nadpisUzla: uzol.nadpis,
      moznost: moznost.id,
      text: textMoznosti(moznost, krok.hodnota),
    };
    if (moznost.nasledok) zaznam.nasledok = moznost.nasledok;
    if (moznost.naklad) zaznam.naklad = moznost.naklad;
    if (krok.hodnota !== undefined) zaznam.hodnota = krok.hodnota;
    cesta.push(zaznam);
  });

  const posledny = najdiUzol(scenar, pokus.aktualnyUzol);
  const dokonceny = posledny.typ === 'zaver';

  const body: VyhodnotenyKB[] = scenar.kontrolneBody.map((kb) => {
    const s = stavy.get(kb.id) ?? { boloNesplnene: false };
    let stav: StavKB;
    if (s.posledny === 'splnene') {
      stav = s.boloNesplnene ? 'opravene' : 'spravne';
    } else if (s.posledny === 'nesplnene') {
      stav = 'nevyriesene';
    } else {
      stav = dokonceny ? 'nevyriesene' : 'otvorene';
    }
    return { ...kb, stav };
  });

  const pocty: Record<StavKB, number> = { spravne: 0, opravene: 0, nevyriesene: 0, otvorene: 0 };
  for (const b of body) pocty[b.stav] += 1;

  let verdikt: Verdikt = 'rozpracovane';
  if (dokonceny) {
    const zaver = posledny as ZaverecnyUzol;
    if (zaver.vysledok === 'chyba') verdikt = 'chyba';
    else if (zaver.vysledok === 'komplikacia') verdikt = 'komplikacia';
    else if (pocty.nevyriesene > 0) verdikt = 's-vyhradami';
    else if (pocty.opravene > 0) verdikt = 'zvladnute-po-oprave';
    else verdikt = 'zvladnute';
  }

  const vysledok: Vyhodnotenie = { dokonceny, verdikt, body, naklad, cesta, pocty };
  if (dokonceny) vysledok.zaver = posledny as ZaverecnyUzol;
  return vysledok;
}
