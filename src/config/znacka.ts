/**
 * Obchodné údaje a branding predajného webu.
 *
 * Nič z toho nie je vymyslené „aby to vyzeralo hotovo“: prázdne hodnoty znamenajú,
 * že údaj ešte nie je potvrdený. Zoznam toho, čo treba doplniť pred publikovaním,
 * je v docs/NASADENIE.md.
 */

export const znacka = {
  nazov: 'Chyby na skúšku',
  /**
   * Celé meno poskytovateľa. Zatiaľ sa zámerne neuvádza; keď sa vyplní, ukáže sa
   * sekcia „Kto to robí“, podpis pri kontakte a meno v pätičke aj v ochrane údajov.
   */
  poskytovatel: '',
  /** Telefón v tvare na zobrazenie, napr. '+421 900 000 000'. Prázdny = nikde sa neukáže. */
  telefon: '',
  /** IČO a sídlo poskytovateľa. Prázdne = nikde sa neukážu. */
  ico: '',
  sidlo: '',
  /** Fotka poskytovateľa v public/, napr. 'img/foto.jpg'. Ukáže sa len spolu s menom. */
  fotka: '',
  /** Lehota odpovede, napr. 'jedného pracovného dňa'. Vyplniť, len ak naozaj platí. */
  odpovedDo: '',
  /**
   * Kontaktný e-mail na dopyty. Kým je prázdny, formulár dopyt len pripraví
   * a ponúkne jeho skopírovanie; tlačidlo „Otvoriť e-mail s dopytom“ sa neukáže.
   */
  kontaktEmail: 'info@chybynaskusku.online',
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
    nazov: 'Pilot',
    cena: 690,
    rozsah: [
      '3 situácie z chýb, ktoré sa opakujú u vás',
      'hodinový rozhovor s vedúcim (na rozhovor nemusíte nič písať)',
      'váš názov, logo a farba',
      'zdrojové súbory, spísané pravidlá a návod na úpravu textov',
      'jedno kolo úprav',
    ],
    vhodne: 'Na overenie, či sa tréning vo firme naozaj používa pri zaškoľovaní.',
  },
  {
    id: 'kompletny',
    nazov: 'Kompletný tréning',
    cena: 1900,
    rozsah: [
      '10 situácií pre jednu pracovnú pozíciu',
      'váš názov, logo a farba',
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

/** Suma na web: 1 900 €. Medzery sú nezlomiteľné, suma sa nerozdelí na dva riadky. */
export function formatEur(suma: number): string {
  // Bez desatín pri celých číslach; toLocaleString dáva medzi tisícami nezlomiteľnú alebo úzku medzeru.
  const cele = Number.isInteger(suma);
  const text = suma.toLocaleString('sk-SK', {
    minimumFractionDigits: cele ? 0 : 2,
    maximumFractionDigits: 2,
  });
  return `${text.replace(/[\s\u202f]/g, '\u00a0')}\u00a0€`;
}

/** Suma do textu e-mailu: 1 900 € s obyčajnými medzerami (e-mailové programy, kopírovanie). */
export function formatEurText(suma: number): string {
  return formatEur(suma).replace(/\u00a0/g, ' ');
}
