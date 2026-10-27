import { useEffect, type CSSProperties } from 'react';

/**
 * Pohyb predajného webu: trieda „pohyb“ na <html> a jednorazové odhalenie prvkov pri scrollovaní.
 *
 * - CSS skrýva obsah pred odhalením len pod triedou „pohyb“ (src/styles.css, sekcia Pohyb).
 *   Bez JavaScriptu, pri chybe, pri tlači aj pri obmedzenom pohybe je všetko viditeľné hneď.
 * - Trieda sa pridá, len keď prehliadač vie IntersectionObserver a návštevník nechce obmedziť pohyb.
 *   Keď si obmedzenie zapne počas návštevy, trieda zmizne a skryté prvky sa ukážu.
 * - Prvok s atribútom data-odhal dostane triedu „je-odhalene“ raz, keď sa dostane do okna alebo
 *   nad neho (skok na kotvu, rýchly posun), a potom sa už nesleduje. Prvky odhalené naraz dostanú
 *   poradie (--poradie) pre odstup v sérii: na širokej obrazovke idú doklady v rade za sebou,
 *   v mobile prichádza každý sám a nečaká.
 */

export const TRIEDA_POHYB = 'pohyb';
export const TRIEDA_ODHALENE = 'je-odhalene';
export const SELEKTOR_ODHAL = '[data-odhal]';

/** Najvyššie poradie v jednej sérii: pri rýchlom posune posledný prvok nečaká dlhšie ako 4 odstupy. */
export const MAX_PORADIE = 4;

const DOTAZ_POHYB = '(prefers-reduced-motion: no-preference)';

/**
 * Hranica odhalenia: horný okraj okna je posunutý ďaleko nahor, takže prvok nad oknom sa počíta
 * ako odhalený; spodný je o 8 % výšky okna vyššie, prvok sa ukáže, až keď je naozaj na očiach.
 */
const OKRAJ_POZOROVANIA = '100000px 0px -8% 0px';

/** Časť okna, ktorú modul používa (v teste sa podstrčí náhrada). */
export interface OknoPohybu {
  matchMedia?: (dotaz: string) => {
    matches: boolean;
    addEventListener?: (typ: 'change', posluchac: () => void) => void;
  };
  IntersectionObserver?: typeof IntersectionObserver;
}

/** Udalosti fokusu na dokumente (prvok skrytý pred odhalením sa pri fokuse ukáže hneď). */
export interface ZdrojFokusu {
  addEventListener: (typ: 'focusin', posluchac: (e: Event) => void) => void;
  removeEventListener: (typ: 'focusin', posluchac: (e: Event) => void) => void;
}

/** Poradie prvku v sérii pre CSS; odstup medzi prvkami je v styles.css (--pohyb-odstup). */
export function poradie(i: number): CSSProperties {
  return { '--poradie': i } as CSSProperties;
}

/** Smie stránka hýbať prvkami: prehliadač vie IntersectionObserver a návštevník nechce obmedziť pohyb. */
export function smiePohyb(okno: OknoPohybu): boolean {
  if (typeof okno.IntersectionObserver !== 'function' || typeof okno.matchMedia !== 'function') return false;
  try {
    return okno.matchMedia(DOTAZ_POHYB).matches;
  } catch {
    return false;
  }
}

/** Pridá triedu „pohyb“ na koreň dokumentu. Volá sa raz pred prvým vykreslením (src/main.tsx). */
export function zapniPohyb(koren: Pick<HTMLElement, 'classList'>, okno: OknoPohybu): void {
  if (!smiePohyb(okno) || !okno.matchMedia) return;
  koren.classList.add(TRIEDA_POHYB);
  const dotaz = okno.matchMedia(DOTAZ_POHYB);
  dotaz.addEventListener?.('change', () => {
    if (!dotaz.matches) koren.classList.remove(TRIEDA_POHYB);
  });
}

/**
 * Sleduje prvky a každému raz pridá triedu „je-odhalene“. Vráti funkciu na upratanie.
 * Bez IntersectionObserver (alebo keď ho nejde vytvoriť) odhalí všetko hneď.
 */
/**
 * `hornyOkraj` je výška lepkavej hlavičky: prvok schovaný pod ňou sa odhalí hneď a nezaberie miesto
 * v sérii, takže pri skoku na kotvu sa nadpis cieľovej sekcie neoneskorí.
 */
export function sledujOdhalenie(prvky: HTMLElement[], okno: OknoPohybu, fokus?: ZdrojFokusu, hornyOkraj = 0): () => void {
  const sledovane = new Set(prvky);
  const odhal = (prvok: HTMLElement, i: number) => {
    sledovane.delete(prvok);
    prvok.style.setProperty('--poradie', String(i));
    prvok.classList.add(TRIEDA_ODHALENE);
  };
  const odhalVsetko = () => {
    for (const p of [...sledovane]) odhal(p, 0);
    return () => undefined;
  };

  const Pozorovatel = okno.IntersectionObserver;
  if (!Pozorovatel) return odhalVsetko();
  let pozorovatel: IntersectionObserver;
  try {
    pozorovatel = new Pozorovatel(
      (zaznamy) => {
        let i = 0;
        for (const z of zaznamy) {
          const prvok = z.target as HTMLElement;
          if (!z.isIntersecting || !sledovane.has(prvok)) continue;
          pozorovatel.unobserve(prvok);
          // Prvok nad oknom alebo pod hlavičkou nikto nevidí, odhalí sa bez čakania a neberie miesto v sérii.
          odhal(prvok, z.boundingClientRect.bottom <= hornyOkraj ? 0 : Math.min(i++, MAX_PORADIE));
        }
      },
      { rootMargin: OKRAJ_POZOROVANIA, threshold: 0 },
    );
  } catch {
    return odhalVsetko();
  }
  for (const p of sledovane) pozorovatel.observe(p);

  // Klávesnica: fokus v ešte skrytom prvku (Tab, hľadanie na stránke) ho odhalí hneď,
  // aj keď ho prehliadač posunul len k spodnému okraju okna.
  const priFokuse = (e: Event) => {
    const ciel = e.target as Element | null;
    const prvok = typeof ciel?.closest === 'function' ? (ciel.closest(SELEKTOR_ODHAL) as HTMLElement | null) : null;
    if (prvok && sledovane.has(prvok)) {
      pozorovatel.unobserve(prvok);
      odhal(prvok, 0);
    }
  };
  fokus?.addEventListener('focusin', priFokuse);

  return () => {
    pozorovatel.disconnect();
    fokus?.removeEventListener('focusin', priFokuse);
  };
}

/** Odhalenie všetkých prvkov s data-odhal na stránke; volá sa raz v komponente stránky. */
export function useOdhalenie(): void {
  useEffect(() => {
    // Bez triedy „pohyb“ CSS nič neskrýva, netreba nič sledovať.
    if (!document.documentElement.classList.contains(TRIEDA_POHYB)) return undefined;
    const prvky = Array.from(document.querySelectorAll<HTMLElement>(`${SELEKTOR_ODHAL}:not(.${TRIEDA_ODHALENE})`));
    const hlavicka = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--vyska-hlavicky')) || 0;
    return sledujOdhalenie(prvky, window, document, hlavicka);
  }, []);
}
