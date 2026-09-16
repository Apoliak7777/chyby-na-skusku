/**
 * Obchodné údaje a branding predajného webu.
 *
 * Nič z toho nie je vymyslené „aby to vyzeralo hotovo“: prázdne hodnoty znamenajú,
 * že údaj ešte nie je potvrdený. Zoznam toho, čo treba doplniť pred publikovaním,
 * je v docs/NASADENIE.md.
 */

export const znacka = {
  nazov: 'Chyby na skúšku',
  /** Kto službu poskytuje (zobrazuje sa v pätičke a v dopyte). */
  poskytovatel: 'Alex Poliak',
  /**
   * Kontaktný e-mail na dopyty. Kým je prázdny, formulár dopyt len pripraví
   * a ponúkne jeho skopírovanie; tlačidlo „Otvoriť e-mail s dopytom“ sa neukáže.
   */
  kontaktEmail: '',
  /** Verejná adresa webu. */
  webAdresa: 'https://chybynaskusku.online',
  /**
   * Poznámka k DPH pri cenách. Nastaví sa podľa skutočných fakturačných údajov;
   * do vtedy sa pri cenách žiadny daňový status neuvádza.
   */
  dphPoznamka: '',
  /** Rok pre pätičku. */
  rok: 2026,
};

export interface Balicek {
  id: string;
  nazov: string;
  cena: number;
  /** Krátke zhrnutie rozsahu. */
  rozsah: string[];
  /** Pre koho / kedy. */
  vhodne: string;
}

export const balicky: Balicek[] = [
  {
    id: 'pilot',
    nazov: 'Platený pilot',
    cena: 690,
    rozsah: [
      '3 situácie pre jednu pracovnú pozíciu',
      'vstupný rozhovor o chybách a postupoch',
      'jednoduché firemné označenie (názov, logo, farba)',
      'jedno súhrnné kolo úprav',
    ],
    vhodne: 'Na overenie, či sa tréning vo firme naozaj používa pri zaškoľovaní.',
  },
  {
    id: 'kompletny',
    nazov: 'Kompletný tréning',
    cena: 1900,
    rozsah: [
      '10 situácií pre jednu pracovnú pozíciu',
      'firemný vzhľad',
      'dve súhrnné kolá úprav',
      'návod a odovzdanie zdrojov',
    ],
    vhodne: 'Pre pozíciu, ktorú zaškoľujete opakovane a máte spísané postupy.',
  },
  {
    id: 'rozsirenie',
    nazov: 'Rozšírenie',
    cena: 490,
    rozsah: ['5 nových situácií v existujúcom tréningu', 'jedno súhrnné kolo úprav'],
    vhodne: 'Keď pribudnú nové prípady alebo sa zmenia pravidlá.',
  },
];

/** Čo sa dohodne osobitne (nie je v cene balíčkov). */
export const mimoCeny = [
  'hosting tréningu v prostredí firmy alebo u nás',
  'napojenie na firemné systémy (ERP, CRM, HR, LMS)',
  'ďalšie jazyky',
  'nové pracovné pozície',
];

export const dodanie = {
  pilotPracovneDni: '7 až 10 pracovných dní od dodania úplných podkladov',
  poznamka:
    'Pri prvej reálnej zákazke sa termín potvrdí individuálne. Tréning nevzniká automaticky za pár minút. Každú situáciu s vami prejdeme a necháme si ju schváliť.',
};

export function formatEur(suma: number): string {
  // 1 900 € – medzera ako oddeľovač tisícov, bez desatín pri celých číslach
  const cele = Number.isInteger(suma);
  const text = suma.toLocaleString('sk-SK', {
    minimumFractionDigits: cele ? 0 : 2,
    maximumFractionDigits: 2,
  });
  return `${text.replace(/ /g, ' ')} €`;
}
