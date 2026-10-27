import { describe, expect, it } from 'vitest';
import { nezlomitelneMedzery, rozdelPodlaKodov } from './sadzba';

const N = ' ';

describe('sadzba textov tréningu', () => {
  it('jednopísmenové predložky a spojky sa nenechajú na konci riadka, aj dve za sebou', () => {
    expect(nezlomitelneMedzery('montáž máme v sobotu')).toBe(`montáž máme v${N}sobotu`);
    expect(nezlomitelneMedzery('3 kusy teraz a v utorok')).toBe(`3${N}kusy teraz a${N}v${N}utorok`);
    expect(nezlomitelneMedzery('V systéme vidíte')).toBe(`V${N}systéme vidíte`);
    expect(nezlomitelneMedzery('(s porovnaním)')).toBe(`(s${N}porovnaním)`);
  });

  it('s. r. o., dátum, tisíce, číslo s jednotkou a číslo rozhodnutia', () => {
    expect(nezlomitelneMedzery('Dielne Vrábel s. r. o.')).toBe(`Dielne Vrábel${N}s.${N}r.${N}o.`);
    expect(nezlomitelneMedzery('Stav k 26. 10. 2026')).toBe(`Stav k${N}26.${N}10.${N}2026`);
    expect(nezlomitelneMedzery('faktúra na 1 512 €')).toBe(`faktúra na 1${N}512${N}€`);
    expect(nezlomitelneMedzery('18 kusov ÷ 6 = 3 bal')).toBe(`18${N}kusov ÷ 6${N}= 3${N}bal`);
    expect(nezlomitelneMedzery('Rozhodnutie č. 2')).toBe(`Rozhodnutie č.${N}2`);
  });

  it('obyčajný text a slová, ktoré len začínajú písmenom predložky, nemení', () => {
    expect(nezlomitelneMedzery('Sklad volá')).toBe('Sklad volá');
    expect(nezlomitelneMedzery('súhrn situácie')).toBe('súhrn situácie');
  });

  it('kódy produktov a objednávok oddelí, aby sa nelámali na spojovníku', () => {
    expect(rozdelPodlaKodov('9 ks pre D-1038, náhrada L-240B a K-6.')).toEqual([`9${N}ks pre `, 'D-1038', ', náhrada ', 'L-240B', ` a${N}`, 'K-6', '.']);
    expect(rozdelPodlaKodov('bez kódu')).toEqual(['bez kódu']);
  });
});
