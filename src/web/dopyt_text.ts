import { balicky, formatEurText, znacka } from '../config/znacka';

/**
 * Príprava dopytu bez backendu: text vzniká v prehliadači, návštevník ho skopíruje
 * alebo (ak je nastavený kontaktný e-mail) otvorí vo svojom e-mailovom programe.
 * Nič sa neodosiela z tejto stránky. E-mail návštevníka netreba, odpoveď ide na adresu,
 * z ktorej dopyt pošle.
 */

/** Najdlhší opis situácie: dlhší mailto: odkaz niektoré e-mailové programy orežú alebo neotvoria. */
export const MAX_DLZKA_SITUACIE = 500;

export interface DopytVstup {
  situacia: string;
  firma?: string;
  telefon?: string;
  balicek?: string;
}

export interface ChybaPola {
  pole: keyof DopytVstup;
  sprava: string;
}

export function validujDopyt(v: DopytVstup): ChybaPola[] {
  const chyby: ChybaPola[] = [];
  if (v.situacia.trim().length < 5) {
    chyby.push({ pole: 'situacia', sprava: 'Napíšte aspoň pár slov o tom, kde sa nový človek mýli.' });
  }
  return chyby;
}

export function nazovBalicka(id: string | undefined): string {
  const b = balicky.find((x) => x.id === id);
  return b ? `${b.nazov} (${formatEurText(b.cena)})` : 'ešte neviem, poraďte';
}

export function zostavDopyt(v: DopytVstup): { predmet: string; telo: string } {
  const firma = v.firma?.trim() ?? '';
  const predmet = firma ? `Dopyt: ${znacka.nazov}, ${firma}` : `Dopyt: ${znacka.nazov}`;
  const riadky = [
    `Dobrý deň,`,
    ``,
    `nový človek sa u nás najčastejšie pomýli takto:`,
    v.situacia.trim(),
    ``,
    `Firma: ${firma || 'neuvedená'}`,
    `Telefón: ${v.telefon?.trim() || 'neuvedený'}`,
    `Zaujíma nás: ${nazovBalicka(v.balicek)}`,
    ``,
    `Prosím o ponuku.`,
    ``,
    `S pozdravom`,
    firma,
  ];
  return { predmet, telo: riadky.join('\n').trimEnd() };
}

/**
 * mailto: odkaz s korektne zakódovaným predmetom a telom. Bez adresy vznikne odkaz len
 * s predmetom a telom (adresáta doplní návštevník).
 */
export function mailtoOdkaz(adresa: string, predmet: string, telo: string): string {
  const params = new URLSearchParams();
  params.set('subject', predmet);
  // RFC 6068: nový riadok v tele je CRLF, inak ho niektoré staršie programy zlúčia.
  params.set('body', telo.replace(/\r?\n/g, '\r\n'));
  // URLSearchParams kóduje medzery ako '+', e-mailové programy čakajú %20.
  return `mailto:${adresa}?${params.toString().replace(/\+/g, '%20')}`;
}
