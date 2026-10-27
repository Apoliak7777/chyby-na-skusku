import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { balicky } from './config/znacka';

/**
 * Ceny v index.html (JSON-LD, popis a náhľad odkazu) sú zapísané natvrdo. Tento test ich
 * porovná s balíčkami v src/config/znacka.ts, aby sa po zmene ceny nezabudli.
 * Porovnáva sa podľa poradia a ceny, nie podľa názvu.
 */

const indexHtml = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const ukazkaHtml = readFileSync(new URL('../public/ukazka/index.html', import.meta.url), 'utf8');

interface Ponuka {
  '@type': string;
  name: string;
  price: string;
  priceCurrency: string;
}

function jsonLd(html: string): Record<string, unknown> {
  const m = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/.exec(html);
  if (!m?.[1]) throw new Error('V index.html chýba JSON-LD.');
  return JSON.parse(m[1]) as Record<string, unknown>;
}

function obsahMeta(html: string, atribut: 'name' | 'property', nazov: string): string {
  const m = new RegExp(`<meta\\s+${atribut}="${nazov}"\\s+content="([^"]*)"`).exec(html);
  if (!m?.[1]) throw new Error(`Chýba <meta ${atribut}="${nazov}">.`);
  return m[1];
}

/** „690 €“ s obyčajnou alebo nezlomiteľnou medzerou a s medzerou v tisícoch („1 900 €“). */
function vzorCeny(cena: number): RegExp {
  const cislo = String(cena).replace(/\B(?=(\d{3})+(?!\d))/g, '[\\s\\u00a0]?');
  return new RegExp(`(^|[^\\d])${cislo}[\\s\\u00a0]€`);
}

const graf = (jsonLd(indexHtml)['@graph'] ?? []) as Array<Record<string, unknown>>;
const sluzba = graf.find((uzol) => uzol['@type'] === 'Service');
const ponuky = (sluzba?.offers ?? []) as Ponuka[];
const pilot = balicky.find((b) => b.id === 'pilot');

describe('JSON-LD a popis v index.html', () => {
  it('má službu s ponukami', () => {
    expect(sluzba).toBeDefined();
    expect(ponuky.length).toBeGreaterThan(0);
  });

  it('ceny ponúk sedia s balíčkami v znacka.ts (rovnaké poradie)', () => {
    expect(ponuky.map((p) => Number(p.price))).toEqual(balicky.map((b) => b.cena));
    for (const p of ponuky) {
      expect(p['@type']).toBe('Offer');
      expect(p.priceCurrency).toBe('EUR');
      expect(p.price).toMatch(/^\d+(\.\d{2})?$/);
    }
  });

  it('prvá ponuka je pilot s názvom „Pilot“', () => {
    expect(pilot).toBeDefined();
    expect(balicky[0]?.id).toBe('pilot');
    expect(ponuky[0]?.name).toBe('Pilot');
  });

  it('popis a náhľad odkazu uvádzajú cenu pilotu', () => {
    const cena = vzorCeny(pilot?.cena ?? NaN);
    expect(obsahMeta(indexHtml, 'name', 'description')).toMatch(cena);
    expect(obsahMeta(indexHtml, 'property', 'og:description')).toMatch(cena);
    expect(obsahMeta(ukazkaHtml, 'property', 'og:description')).toMatch(cena);
  });

  it('bez hodnotení a recenzií (žiadne nie sú)', () => {
    expect(indexHtml).not.toMatch(/aggregateRating|"review"|ratingValue/);
  });
});
