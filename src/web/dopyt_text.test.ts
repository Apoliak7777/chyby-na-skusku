import { describe, expect, it } from 'vitest';
import { formatEur, formatEurText } from '../config/znacka';
import { mailtoOdkaz, nazovBalicka, validujDopyt, zostavDopyt, type DopytVstup } from './dopyt_text';
import { mailtoJednaVeta, mailtoVeducemu, TELO_JEDNA_VETA } from './kontakt';

const platny: DopytVstup = {
  situacia: 'Nový človek potvrdí termín bez kontroly rezervácií.',
  firma: 'Veľkoobchod Test s. r. o.',
  telefon: '',
  balicek: 'pilot',
};

describe('validácia dopytu', () => {
  it('platný dopyt nemá chyby', () => {
    expect(validujDopyt(platny)).toEqual([]);
  });

  it('stačí jedna veta, firma ani telefón nie sú povinné', () => {
    expect(validujDopyt({ situacia: 'Zamieňajú kusy a balenia.' })).toEqual([]);
  });

  it('prázdna situácia sa nahlási', () => {
    expect(validujDopyt({ situacia: '  ' }).map((c) => c.pole)).toEqual(['situacia']);
  });
});

describe('text dopytu', () => {
  it('obsahuje situáciu, firmu a názov balíčka', () => {
    const { predmet, telo } = zostavDopyt(platny);
    expect(predmet).toBe('Dopyt: Chyby na skúšku, Veľkoobchod Test s. r. o.');
    expect(telo).toContain('nový človek sa u nás najčastejšie pomýli takto:\nNový človek potvrdí termín');
    expect(telo).toContain('Firma: Veľkoobchod Test s. r. o.');
    expect(telo).toContain('Telefón: neuvedený');
    expect(telo).toContain('Zaujíma nás: Pilot (690 €)');
    expect(telo).toContain(platny.situacia);
  });

  it('cena balíčka v e-maile má medzeru v tisícoch, obyčajnú a nie nezlomiteľnú', () => {
    expect(nazovBalicka('kompletny')).toBe('Kompletný tréning (1 900 €)');
    expect(nazovBalicka('rozsirenie')).toBe('Rozšírenie (490 €)');
  });

  it('bez firmy má predmet len názov služby a neznámy balíček neutrálny text', () => {
    const { predmet, telo } = zostavDopyt({ situacia: 'Zamieňajú kusy a balenia.' });
    expect(predmet).toBe('Dopyt: Chyby na skúšku');
    expect(telo).toContain('Firma: neuvedená');
    expect(telo).toContain('ešte neviem, poraďte');
  });

  it('text nemá dekoratívne pomlčky', () => {
    const { predmet, telo } = zostavDopyt(platny);
    expect(`${predmet}\n${telo}`).not.toMatch(/ [–—] /);
  });
});

describe('sumy', () => {
  it('na webe s nezlomiteľnými medzerami, v e-maile s obyčajnými', () => {
    expect(formatEur(1900)).toBe('1\u00a0900\u00a0€');
    expect(formatEur(690)).toBe('690\u00a0€');
    expect(formatEur(12.5)).toBe('12,50\u00a0€');
    expect(formatEurText(1900)).toBe('1 900 €');
  });
});

describe('mailto odkaz', () => {
  it('správne zakóduje predmet a telo vrátane diakritiky a nových riadkov (CRLF)', () => {
    const odkaz = mailtoOdkaz('test@example.com', 'Dopyt: skúška', 'riadok 1\nriadok 2 & čiarka + plus');
    expect(odkaz.startsWith('mailto:test@example.com?subject=')).toBe(true);
    expect(odkaz).not.toContain('+');
    expect(odkaz).toContain('%0D%0A');
    expect(odkaz).not.toMatch(/[^D]%0A/);
    const url = new URL(odkaz);
    expect(url.searchParams.get('subject')).toBe('Dopyt: skúška');
    expect(url.searchParams.get('body')).toBe('riadok 1\r\nriadok 2 & čiarka + plus');
  });

  it('jedna veta ide na kontaktnú adresu a začína gramatickou vetou', () => {
    expect(mailtoJednaVeta()).toMatch(/^mailto:info@chybynaskusku\.online\?subject=/);
    expect(TELO_JEDNA_VETA).toContain('nový človek sa u nás najčastejšie pomýli takto: ');
    expect(TELO_JEDNA_VETA).toContain('Telefón (ak je jednoduchšie zavolať): ');
    expect(new URL(mailtoJednaVeta()).searchParams.get('body')).toContain('\r\n');
  });

  it('odkaz pre vedúceho je bez adresáta, s oslovením a odkazom na ukážku', () => {
    const veducemu = new URL(mailtoVeducemu());
    expect(veducemu.pathname).toBe('');
    expect(veducemu.searchParams.get('subject')).toBe('Tréning pre nového človeka na príjme objednávok');
    const telo = veducemu.searchParams.get('body') ?? '';
    expect(telo.startsWith('Dobrý deň,\r\n\r\n')).toBe(true);
    expect(telo).toContain('https://chybynaskusku.online/#/demo/slubeny-termin');
    expect(telo).toContain('Pilot stojí 690 €');
  });
});
