import { describe, expect, it } from 'vitest';
import { mailtoOdkaz, validujDopyt, zostavDopyt, type DopytVstup } from './dopyt_text';

const platny: DopytVstup = {
  firma: 'Veľkoobchod Test s. r. o.',
  email: 'objednavky@test-firma.sk',
  pozicia: 'Pracovník príjmu objednávok',
  situacia: 'Nováčik potvrdí termín bez toho, aby pozrel rezervácie v sklade.',
  telefon: '',
  balicek: 'pilot',
};

describe('validácia dopytu', () => {
  it('platný dopyt nemá chyby', () => {
    expect(validujDopyt(platny)).toEqual([]);
  });

  it('chýbajúce polia a zlý e-mail sa nahlásia', () => {
    const chyby = validujDopyt({ firma: ' ', email: 'nie-email', pozicia: '', situacia: 'krátke' });
    expect(chyby.map((c) => c.pole)).toEqual(['firma', 'email', 'pozicia', 'situacia']);
  });
});

describe('text dopytu', () => {
  it('obsahuje všetky zadané údaje a názov balíčka', () => {
    const { predmet, telo } = zostavDopyt(platny);
    expect(predmet).toBe('Dopyt – Chyby na skúšku – Veľkoobchod Test s. r. o.');
    expect(telo).toContain('Firma: Veľkoobchod Test s. r. o.');
    expect(telo).toContain('Kontaktný e-mail: objednavky@test-firma.sk');
    expect(telo).toContain('Telefón: neuvedený');
    expect(telo).toContain('Pracovná pozícia na zaškolenie: Pracovník príjmu objednávok');
    expect(telo).toContain('Platený pilot (690 €, úvodná ponuka)');
    expect(telo).toContain(platny.situacia);
  });

  it('neznámy balíček sa nahradí neutrálnym textom', () => {
    expect(zostavDopyt({ ...platny, balicek: undefined }).telo).toContain('ešte neviem, poraďte');
  });
});

describe('mailto odkaz', () => {
  it('správne zakóduje predmet a telo vrátane diakritiky a nových riadkov', () => {
    const odkaz = mailtoOdkaz('test@example.com', 'Dopyt – skúška', 'riadok 1\nriadok 2 & čiarka');
    expect(odkaz.startsWith('mailto:test@example.com?subject=')).toBe(true);
    expect(odkaz).not.toContain('+');
    expect(odkaz).toContain('%0A');
    const url = new URL(odkaz);
    expect(url.searchParams.get('subject')).toBe('Dopyt – skúška');
    expect(url.searchParams.get('body')).toBe('riadok 1\nriadok 2 & čiarka');
  });
});
