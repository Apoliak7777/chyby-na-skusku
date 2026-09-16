import { balicky, znacka } from '../config/znacka';

/**
 * Príprava dopytu bez backendu: text vzniká v prehliadači, návštevník ho skopíruje
 * alebo (ak je nastavený kontaktný e-mail) otvorí vo svojom e-mailovom programe.
 * Nič sa neodosiela z tejto stránky.
 */

export interface DopytVstup {
  firma: string;
  email: string;
  pozicia: string;
  situacia: string;
  telefon?: string;
  balicek?: string;
}

export interface ChybaPola {
  pole: keyof DopytVstup;
  sprava: string;
}

const EMAIL_VZOR = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validujDopyt(v: DopytVstup): ChybaPola[] {
  const chyby: ChybaPola[] = [];
  if (!v.firma.trim()) chyby.push({ pole: 'firma', sprava: 'Uveďte názov firmy.' });
  if (!v.email.trim()) chyby.push({ pole: 'email', sprava: 'Uveďte kontaktný e-mail.' });
  else if (!EMAIL_VZOR.test(v.email.trim())) chyby.push({ pole: 'email', sprava: 'E-mail nemá správny tvar (napr. meno@firma.sk).' });
  if (!v.pozicia.trim()) chyby.push({ pole: 'pozicia', sprava: 'Uveďte pracovnú pozíciu, ktorú chcete zaškoľovať.' });
  if (v.situacia.trim().length < 20) {
    chyby.push({ pole: 'situacia', sprava: 'Opíšte jednu situáciu aspoň jednou-dvoma vetami (najmenej 20 znakov).' });
  }
  return chyby;
}

export function nazovBalicka(id: string | undefined): string {
  const b = balicky.find((x) => x.id === id);
  return b ? `${b.nazov} (${b.cena} €, úvodná ponuka)` : 'ešte neviem, poraďte';
}

export function zostavDopyt(v: DopytVstup): { predmet: string; telo: string } {
  const firma = v.firma.trim();
  const predmet = `Dopyt – ${znacka.nazov} – ${firma}`;
  const riadky = [
    `Dobrý deň,`,
    ``,
    `máme záujem o tréning pracovných rozhodnutí pre našu firmu.`,
    ``,
    `Firma: ${firma}`,
    `Kontaktný e-mail: ${v.email.trim()}`,
    `Telefón: ${v.telefon?.trim() || 'neuvedený'}`,
    `Pracovná pozícia na zaškolenie: ${v.pozicia.trim()}`,
    `Balíček, ktorý nás zaujíma: ${nazovBalicka(v.balicek)}`,
    ``,
    `Situácia, ktorú chceme precvičiť:`,
    v.situacia.trim(),
    ``,
    `Prosíme o návrh ďalšieho postupu.`,
    ``,
    `S pozdravom`,
    firma,
  ];
  return { predmet, telo: riadky.join('\n') };
}

/** mailto: odkaz s korektne zakódovaným predmetom a telom. */
export function mailtoOdkaz(adresa: string, predmet: string, telo: string): string {
  const params = new URLSearchParams();
  params.set('subject', predmet);
  params.set('body', telo);
  // URLSearchParams kóduje medzery ako '+', e-mailové programy čakajú %20.
  return `mailto:${adresa}?${params.toString().replace(/\+/g, '%20')}`;
}
