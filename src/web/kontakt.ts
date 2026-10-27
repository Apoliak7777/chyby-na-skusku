import { balicky, formatEurText, znacka } from '../config/znacka';
import { mailtoOdkaz } from './dopyt_text';

/**
 * Kontaktné odkazy s najnižším prahom: jedna veta cez e-mail návštevníka a odkaz
 * pre vedúceho. Zo stránky sa nič neodosiela, otvorí sa len e-mailový program.
 */

export const PREDMET_JEDNA_VETA = 'Chyba, ktorá sa u nás opakuje';

export const TELO_JEDNA_VETA = [
  'Dobrý deň,',
  '',
  'nový človek sa u nás najčastejšie pomýli takto: ',
  '',
  'Firma: ',
  'Telefón (ak je jednoduchšie zavolať): ',
  '',
].join('\n');

/** mailto na kontaktnú adresu s predvyplneným predmetom a začiatkom vety. */
export function mailtoJednaVeta(): string {
  return znacka.kontaktEmail ? mailtoOdkaz(znacka.kontaktEmail, PREDMET_JEDNA_VETA, TELO_JEDNA_VETA) : '#dopyt';
}

/** Adresa, kam vedie odkaz pre vedúceho: rovno prvá situácia ukážky. */
export const ODKAZ_NA_UKAZKU = `${znacka.webAdresa}/#/demo/slubeny-termin`;

/** mailto bez adresáta: návštevník, ktorý nerozhoduje, pošle odkaz vedúcemu. */
export function mailtoVeducemu(): string {
  const cena = formatEurText(balicky.find((b) => b.id === 'pilot')?.cena ?? 690);
  return mailtoOdkaz(
    '',
    'Tréning pre nového človeka na príjme objednávok',
    [
      'Dobrý deň,',
      '',
      'pozrite si, prosím, túto ukážku. Prvá situácia trvá pár minút:',
      ODKAZ_NA_UKAZKU,
      '',
      `Z troch chýb, ktoré sa u nás opakujú, sa dá urobiť klikací tréning pre nového človeka. Pilot stojí ${cena}, jednorazovo, bez predplatného.`,
      '',
    ].join('\n'),
  );
}
