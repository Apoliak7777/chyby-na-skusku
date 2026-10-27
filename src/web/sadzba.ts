import { Children, cloneElement, isValidElement, type ReactNode } from 'react';
import { nezlomitelneMedzery } from '../engine/sadzba';

/**
 * Slovenská sadzba textov predajného webu: jednopísmenová predložka alebo spojka (v, u, z, s,
 * k, o, a, i) neostane na konci riadka, číslo sa neoddelí od jednotky ani od ďalšej časti čísla
 * (1 900 €, 10 pracovných dní, 26. 10. 2026) a „s. r. o.“ sa nerozdelí. Mení len obyčajné
 * medzery na nezlomiteľné, text ostáva rovnaký.
 */

const NBSP = '\u00a0';

/** Číslo (aj s bodkou dátumu alebo desatinnou čiarkou) a medzera pred ďalším slovom: „3 situácie“. */
const CISLO_A_SLOVO = /(\d[.,]?) (?=\S)/g;

/**
 * Pravidlá ukážky (predložky, „s. r. o.“, dátumy, jednotky) zo src/engine/sadzba.ts a navyše
 * číslo vždy spolu s ďalším slovom, lebo predajné texty sú krátke a čísla v nich nesú pointu.
 */
export function sadzba(text: string): string {
  return nezlomitelneMedzery(text).replace(CISLO_A_SLOVO, `$1${NBSP}`);
}

/** Prejde deti prvku (aj vnorené prvky zapísané v tom istom JSX) a upraví v nich text. */
export function upravDeti(deti: ReactNode): ReactNode {
  return Children.map(deti, (dieta) => {
    if (typeof dieta === 'string') return sadzba(dieta);
    if (isValidElement<{ children?: ReactNode }>(dieta) && dieta.props.children !== undefined) {
      return cloneElement(dieta, undefined, upravDeti(dieta.props.children));
    }
    return dieta;
  });
}

/**
 * Obal stránky alebo bloku: upraví text zapísaný priamo v JSX okolo seba. Do iných komponentov
 * (napr. <Dopyt />) nevidí, tie si sadzbu robia samy.
 */
export function Sadzba({ children }: { children: ReactNode }) {
  return upravDeti(children);
}
