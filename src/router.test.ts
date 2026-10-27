import { describe, expect, it } from 'vitest';
import { CESTY, parsujHash } from './router';

describe('hash router', () => {
  it('prázdny hash je predajný web', () => {
    expect(parsujHash('')).toEqual({ cesta: '/', params: new URLSearchParams(), kotva: null });
    expect(parsujHash('#')).toEqual({ cesta: '/', params: new URLSearchParams(), kotva: null });
    expect(parsujHash('#/').cesta).toBe('/');
  });

  it('kotva sekcie ostáva na predajnom webe', () => {
    const t = parsujHash('#cennik');
    expect(t.cesta).toBe('/');
    expect(t.kotva).toBe('cennik');
  });

  it('neplatné kódovanie v kotve nezhodí stránku', () => {
    expect(() => parsujHash('#100%')).not.toThrow();
    expect(parsujHash('#100%')).toEqual({ cesta: '/', params: new URLSearchParams(), kotva: '100%' });
    expect(parsujHash('#%E0%A4%A').kotva).toBe('%E0%A4%A');
    expect(parsujHash('#/demo/slubeny-termin?prva=%').cesta).toBe('/demo/slubeny-termin');
    // Platné kódovanie sa dekóduje ako doteraz.
    expect(parsujHash('#ot%C3%A1zky').kotva).toBe('otázky');
  });

  it('cesty dema vrátane parametrov', () => {
    const t = parsujHash('#/demo/slubeny-termin?prva=s1-start-potvrdit');
    expect(t.cesta).toBe('/demo/slubeny-termin');
    expect(t.params.get('prva')).toBe('s1-start-potvrdit');
    expect(t.kotva).toBeNull();
    expect(parsujHash('#/demo/').cesta).toBe('/demo');
  });

  it('generátor ciest', () => {
    expect(CESTY.scenar('zmena-adresy')).toBe('#/demo/zmena-adresy');
    expect(CESTY.scenar('zmena-adresy', 's3-start-overit')).toBe('#/demo/zmena-adresy?prva=s3-start-overit');
    expect(CESTY.demo).toBe('#/demo');
  });
});
