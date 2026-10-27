/**
 * Slovenská sadzba textov tréningu: čo sa nemá rozdeliť na konci riadka.
 *
 * Dáta scenárov ostávajú s obyčajnými medzerami (dajú sa písať aj hľadať). Nezlomiteľné medzery
 * dopĺňa až zobrazenie: za jednopísmenovou predložkou alebo spojkou, v „s. r. o.“, v dátume,
 * medzi číslom a jednotkou a v tisícoch. Kódy produktov a objednávok (D-1038, L-240B) delí
 * `rozdelPodlaKodov`, rozhranie ich vysadí bez zalomenia.
 */

const NBSP = ' ';

/** Jednopísmenové predložky a spojky; medzera za nimi sa nahradí nezlomiteľnou. */
const JEDNOPISMENOVE = /(^|[\s („"])([aikosuvzAIKOSUVZ]) /g;

/** Jednotky a znaky, ktoré sa od čísla neoddeľujú (12 ks, 84 €, 3 × 84 €, 10 pracovných dní). */
const ZA_CISLOM = /(\d) (?=(?:€|%|×|÷|=|ks\b|kg\b|mm\b|bal\b|kus|balen|palet|minút|hodin|pracovn|dní))/g;

export function nezlomitelneMedzery(text: string): string {
  let vysledok = text
    .replace(/ s\. ?r\. ?o\./g, `${NBSP}s.${NBSP}r.${NBSP}o.`)
    .replace(/(\d{1,2})\. (?=\d)/g, `$1.${NBSP}`)
    .replace(/(\d) (?=\d{3}(?!\d))/g, `$1${NBSP}`)
    .replace(/(^|\s)(č\.) (?=\d)/g, `$1$2${NBSP}`)
    .replace(ZA_CISLOM, `$1${NBSP}`);
  // Dve predložky za sebou („a v“): predchádzajúca zhoda pohltí medzeru, preto ďalšie kolo.
  for (let i = 0; i < 3; i += 1) {
    const dalsi = vysledok.replace(JEDNOPISMENOVE, `$1$2${NBSP}`);
    if (dalsi === vysledok) break;
    vysledok = dalsi;
  }
  return vysledok;
}

/** Kód produktu alebo objednávky: veľké písmená, spojovník, číslo (D-1038, L-240B, K-6). */
const KOD = /\b([A-Z]{1,3}-\d+[A-Z]?)\b/;

/**
 * Rozdelí text na časti; nepárne indexy sú kódy, ktoré sa nemajú zalomiť na spojovníku.
 * Ostatné časti už majú nezlomiteľné medzery.
 */
export function rozdelPodlaKodov(text: string): string[] {
  return nezlomitelneMedzery(text).split(new RegExp(KOD.source, 'g'));
}
