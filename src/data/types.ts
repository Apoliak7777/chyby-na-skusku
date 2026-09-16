/**
 * Dátový model tréningu (pozri docs/SCENARE.md).
 *
 * Tréning → scenáre → uzly → možnosti. Stav pokusu je oddelený (src/engine/pokus.ts)
 * a drží sa len v pamäti stránky.
 */

export type Id = string;

/* ---------- Bloky obsahu (to, čo používateľ číta) ---------- */

export interface EmailBlok {
  typ: 'email';
  od: string;
  komu?: string;
  predmet: string;
  datum?: string;
  /** odseky */
  text: string[];
}

export interface TabulkaBlok {
  typ: 'tabulka';
  nadpis?: string;
  stlpce: string[];
  riadky: string[][];
  poznamka?: string;
}

export interface TextBlok {
  typ: 'text';
  /** odseky */
  text: string[];
}

export interface PoznamkaBlok {
  typ: 'poznamka';
  nadpis?: string;
  text: string[];
}

/** Záznam zo systému: produktová karta, hlavička objednávky, rekapitulácia. */
export interface ZaznamBlok {
  typ: 'zaznam';
  nadpis: string;
  polia: { nazov: string; hodnota: string; zvyraznit?: boolean }[];
}

export interface ZoznamBlok {
  typ: 'zoznam';
  nadpis?: string;
  polozky: string[];
}

/** Zobrazí podklad scenára priamo v príbehu (bez duplikovania obsahu). */
export interface PodkladOdkazBlok {
  typ: 'podklad';
  podklad: Id;
}

export type Blok =
  | EmailBlok
  | TabulkaBlok
  | TextBlok
  | PoznamkaBlok
  | ZaznamBlok
  | ZoznamBlok
  | PodkladOdkazBlok;

/* ---------- Podklady, kontrolné body ---------- */

export type DruhPodkladu = 'email' | 'sklad' | 'produkt' | 'objednavka' | 'pravidla' | 'porovnanie' | 'ine';

export interface Podklad {
  id: Id;
  nazov: string;
  druh: DruhPodkladu;
  bloky: Blok[];
}

export interface KontrolnyBod {
  id: Id;
  /** Krátky názov v minulom čase, napr. „Overil voľnú zásobu“. */
  nazov: string;
  /** Čo sa tým sleduje a prečo. */
  vysvetlenie: string;
  /** Odkiaľ pravidlo pochádza (v deme: podklad scenára; u klienta: schválený dokument). */
  zdrojPravidla: string;
}

export type UcinokKB = 'splnene' | 'nesplnene';

/* ---------- Uzly a možnosti ---------- */

export interface Moznost {
  id: Id;
  /** Text voľby. Pri číselnom vstupe môže obsahovať {hodnota}. */
  text: string;
  /** ID nasledujúceho uzla. */
  dalsi: Id;
  /** Krátky následok, ktorý sa ukáže v prehľade rozhodnutí. */
  nasledok?: string;
  /** Zmeny kontrolných bodov, ktoré táto voľba spôsobí. */
  ucinky?: Record<Id, UcinokKB>;
  /** Modelový náklad v € spôsobený touto voľbou (len ilustrácia). */
  naklad?: number;
  /** Len pri uzle s číselným vstupom: hodnoty, ktoré vedú k tejto možnosti. */
  hodnoty?: number[];
  /** Len pri uzle s číselným vstupom: záchytná možnosť pre všetky ostatné hodnoty. */
  ostatneHodnoty?: boolean;
}

export interface CiselnyVstup {
  popis: string;
  jednotka: string;
  min: number;
  max: number;
  krok?: number;
  /** Živý prepočet pod poľom, napr. balenia → kusy a cena. */
  prepocet?: {
    nasobitel: number;
    jednotkaVysledku: string;
    cenaZaJednotku?: number;
  };
}

export interface RozhodovaciUzol {
  id: Id;
  typ: 'rozhodnutie';
  nadpis: string;
  pribeh: Blok[];
  /** Otázka alebo úloha, na ktorú používateľ odpovedá voľbou. */
  uloha: string;
  /** Podklady, ktoré sú pre tento krok dôležité (zvýraznia sa v paneli). */
  podklady?: Id[];
  /** Ak je vyplnené, používateľ zadáva číslo a možnosti sa vyberajú podľa hodnoty. */
  vstup?: CiselnyVstup;
  moznosti: Moznost[];
  /** Uzol je reakcia na chybný krok (zobrazí sa ako spätná väzba). */
  spatnaVazba?: boolean;
}

export type VysledokZaveru = 'spravne' | 'komplikacia' | 'chyba';

export interface ZaverecnyUzol {
  id: Id;
  typ: 'zaver';
  nadpis: string;
  vysledok: VysledokZaveru;
  pribeh: Blok[];
  /** Rozhodujúce kroky, ktoré súhrn vysvetlí. */
  vysvetlenie: string[];
}

export type Uzol = RozhodovaciUzol | ZaverecnyUzol;

/* ---------- Scenár, tréning ---------- */

export interface SchvalenieObsahu {
  stav: 'koncept' | 'schvalene';
  verziaPravidiel: string;
  /** Referencia na podklad (v deme: zadanie; u klienta: schválený dokument). */
  podklad: string;
  potvrdil?: string;
  datum?: string;
}

export interface Scenar {
  id: Id;
  verzia: string;
  nazov: string;
  /** Jedna–dve vety na predajný web a do prehľadu situácií. */
  strucnyProblem: string;
  pozicia: string;
  /** Čo sa precvičuje. */
  cvici: string;
  /** Úvod pred prvým rozhodnutím (odseky). */
  zadanie: string[];
  podklady: Podklad[];
  vstupnyUzol: Id;
  uzly: Uzol[];
  kontrolneBody: KontrolnyBod[];
  schvalenie: SchvalenieObsahu;
}

export interface Znacka {
  nazovFirmy: string;
  /** true = vymyslená firma; rozhranie to všade označí. */
  jeModelova: boolean;
  /** Krátky text pod názvom firmy, napr. „vymyslená firma pre ukážku“. */
  oznacenie?: string;
}

export interface Trening {
  id: Id;
  verzia: string;
  nazov: string;
  pozicia: string;
  /** demo = verejná ukážka s predajným webom; klient = len prehrávač tréningu. */
  rezim: 'demo' | 'klient';
  znacka: Znacka;
  scenare: Scenar[];
  /** Upozornenie pri štarte (napr. že obnovenie stránky začne odznova). */
  upozornenie?: string;
}
