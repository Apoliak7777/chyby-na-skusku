import { createElement, type ComponentType } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { Landing } from './Landing';
import { OchranaUdajov } from './OchranaUdajov';
import { Podmienky } from './Podmienky';
import { sadzba, upravDeti } from './sadzba';

const N = '\u00a0';

/** Viditeľný text stránky z HTML (bez značiek a komentárov, s rozkódovanými entitami). */
function textStranky(komponent: ComponentType): string {
  return renderToStaticMarkup(createElement(komponent))
    .replace(/<[^>]+>/g, '')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
}

/** Jednopísmenová predložka alebo spojka, za ktorou je obyčajná (zlomiteľná) medzera. */
const PREDLOZKA_NA_KONCI = /(^|[\s(„"])[aikosuvz] /iu;
/** Číslo oddelené obyčajnou medzerou od ďalšej časti čísla, dátumu alebo jednotky. */
const CISLO_NA_KONCI = /\d[.,]? (?:\d|€|%|ks\b|kus|bal|minút|hodin|pracovn|dní|mesiac)/u;

describe('sadzba', () => {
  it('jednopísmenové predložky a spojky viaže k ďalšiemu slovu, aj keď idú za sebou', () => {
    expect(sadzba('chyby sa opakujú u vás')).toBe(`chyby sa opakujú u${N}vás`);
    expect(sadzba('V prehliadači a v mobile')).toBe(`V${N}prehliadači a${N}v${N}mobile`);
    expect(sadzba('„A potom“ (s odkazom)')).toBe(`„A${N}potom“ (s${N}odkazom)`);
  });

  it('číslo neoddelí od jednotky, tisícov ani dátumu', () => {
    expect(sadzba('do 10 pracovných dní')).toBe(`do 10${N}pracovných dní`);
    expect(sadzba('1 512 € namiesto 252 €')).toBe(`1${N}512${N}€ namiesto 252${N}€`);
    expect(sadzba('Stav k 26. 10. 2026')).toBe(`Stav k${N}26.${N}10.${N}2026`);
  });

  it('nerozdelí „s. r. o.“ ani ho neodtrhne od názvu firmy', () => {
    expect(sadzba('Autoservis Kolár s. r. o.')).toBe(`Autoservis Kolár${N}s.${N}r.${N}o.`);
  });

  it('nemení slová, ktoré len končia alebo začínajú rovnakým písmenom', () => {
    expect(sadzba('nový sklad volá')).toBe('nový sklad volá');
    expect(sadzba('info@chybynaskusku.online')).toBe('info@chybynaskusku.online');
  });

  it('upraví text aj vo vnorených prvkoch a nechá atribúty', () => {
    const prvok = createElement('p', { title: 'a b' }, 'Je to v ', createElement('strong', null, 'sklade a v systéme'), '.');
    const html = renderToStaticMarkup(createElement('div', null, upravDeti(prvok)));
    expect(html).toContain('title="a b"');
    expect(html).toContain(`Je to v${N}`);
    expect(html).toContain(`sklade a${N}v${N}systéme`);
  });
});

describe('texty predajného webu', () => {
  for (const [nazov, komponent] of [
    ['úvodná stránka', Landing],
    ['podmienky pilotu', Podmienky],
    ['ochrana údajov', OchranaUdajov],
  ] as const) {
    it(`${nazov}: žiadna jednopísmenová predložka ani číslo na konci riadka`, () => {
      const text = textStranky(komponent);
      expect(text.length).toBeGreaterThan(500);
      expect(text.match(PREDLOZKA_NA_KONCI)?.[0] ?? null).toBeNull();
      expect(text.match(CISLO_NA_KONCI)?.[0] ?? null).toBeNull();
      expect(text).not.toMatch(/ [–—] /);
    });
  }
});
