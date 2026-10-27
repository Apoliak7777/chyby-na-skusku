import { useEffect, useRef, useState, type RefObject } from 'react';

/**
 * Pohyb v ukážke: samotné animácie sú v demo.css (sekcia Pohyb), len transform a opacity,
 * len na obrazovke a len bez prefers-reduced-motion. Tu sú dve malé pomôcky, ktoré určia,
 * kedy sa animácia smie spustiť. Prvé vykreslenie situácie je bez pohybu (nezdržiava obsah
 * ani prvú obrazovku), pohyb dostane až to, čo vzniklo rozhodnutím.
 */

/** Pohyb je dovolený a prehliadač vie, kedy je prvok v okne. Pri akejkoľvek pochybnosti nie. */
function odhalenieMozne(): boolean {
  try {
    return typeof IntersectionObserver === 'function' && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch {
    return false;
  }
}

/**
 * True od prvej zmeny kľúča po pripojení komponentu. Uzol, s ktorým sa situácia otvorila,
 * sa ukáže hneď a bez pohybu; každý ďalší (aj návrat ku kroku či nový pokus) s pohybom.
 * Hodnota sa zistí už pri vykreslení, takže nový uzol nebliká bez triedy ani na jeden snímok.
 */
export function usePoZmene(kluc: string): boolean {
  const [prvy] = useState(kluc);
  const [zmenene, setZmenene] = useState(false);
  if (!zmenene && kluc !== prvy) setZmenene(true);
  return zmenene || kluc !== prvy;
}

/**
 * Odhalenie pri prvom vstupe do okna. Kým prvok čaká, má triedu „odhalit“ (skrytý len
 * v CSS pre obrazovku bez reduced motion), po vstupe aj „odhalene“ (animácia beží raz).
 * Do --uplynulo zapíše čas od pripojenia, aby CSS vedelo dorovnať poradie v sérii:
 * prvok viditeľný hneď počká na svoje miesto, prvok odhalený neskôr posunom nečaká.
 * Bez IntersectionObserver, pri chybe alebo pri reduced motion sa nič neskrýva.
 */
export function useOdhalenie<T extends HTMLElement>(zapnute: boolean): [RefObject<T | null>, string] {
  const ref = useRef<T>(null);
  const [stav, setStav] = useState<'caka' | 'odhalene' | 'bez'>(() => (zapnute && odhalenieMozne() ? 'caka' : 'bez'));

  useEffect(() => {
    if (stav !== 'caka') return undefined;
    const prvok = ref.current;
    const pripojene = performance.now();
    let pozorovatel: IntersectionObserver | undefined;
    try {
      if (!prvok) throw new Error('Prvok na odhalenie chýba.');
      pozorovatel = new IntersectionObserver(
        (zaznamy) => {
          if (!zaznamy.some((z) => z.isIntersecting)) return;
          pozorovatel?.disconnect();
          prvok.style.setProperty('--uplynulo', `${Math.round(performance.now() - pripojene)}ms`);
          setStav('odhalene');
        },
        { rootMargin: '0px 0px -8% 0px' },
      );
      pozorovatel.observe(prvok);
    } catch {
      setStav('bez');
    }
    return () => pozorovatel?.disconnect();
  }, [stav]);

  return [ref, stav === 'caka' ? 'odhalit' : stav === 'odhalene' ? 'odhalit odhalene' : ''];
}
