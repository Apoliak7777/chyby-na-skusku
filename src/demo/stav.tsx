import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import type { Id, Scenar, Trening } from '../data/types';
import {
  jeDokonceny,
  novyPokus,
  vratSaKuKroku,
  vyberMoznost as engineVyberMoznost,
  vyhodnot,
  zadajHodnotu as engineZadajHodnotu,
  type Pokus,
  type Vyhodnotenie,
} from '../engine/pokus';

/**
 * Stav dema: aktuálne pokusy a posledné dokončené pokusy pre každý scenár.
 * Drží sa výhradne v pamäti stránky – nič sa neukladá ani neposiela.
 */

export interface DokoncenyPokus {
  pokus: Pokus;
  vyhodnotenie: Vyhodnotenie;
  dokoncenyO: number;
}

interface DemoKontext {
  trening: Trening;
  /** Aktuálny pokus scenára (ak ešte nezačal, čistý). */
  pokus(scenar: Scenar): Pokus;
  /** Posledný dokončený pokus (na porovnanie s aktuálnym, zreteľne oddelený). */
  posledneDokoncene(scenarId: Id): DokoncenyPokus | undefined;
  zacniOdznova(scenar: Scenar): void;
  vyber(scenar: Scenar, moznostId: Id, hodnota?: number): void;
  /** Môže vyhodiť chybu (hodnota mimo rozsahu) – volajúci ju zobrazí. */
  zadaj(scenar: Scenar, hodnota: number): void;
  vratSa(scenar: Scenar, index: number): void;
}

const Kontext = createContext<DemoKontext | null>(null);

export function DemoProvider({ trening, children }: { trening: Trening; children: ReactNode }) {
  const [pokusy, setPokusy] = useState<Record<Id, Pokus | undefined>>({});
  const [dokoncene, setDokoncene] = useState<Record<Id, DokoncenyPokus | undefined>>({});

  const pokus = useCallback((scenar: Scenar): Pokus => pokusy[scenar.id] ?? novyPokus(scenar), [pokusy]);

  const uloz = useCallback((scenar: Scenar, novy: Pokus) => {
    setPokusy((p) => ({ ...p, [scenar.id]: novy }));
    if (jeDokonceny(scenar, novy)) {
      setDokoncene((d) => ({ ...d, [scenar.id]: { pokus: novy, vyhodnotenie: vyhodnot(scenar, novy), dokoncenyO: Date.now() } }));
    }
  }, []);

  const hodnota = useMemo<DemoKontext>(
    () => ({
      trening,
      pokus,
      posledneDokoncene: (id) => dokoncene[id],
      zacniOdznova: (scenar) => setPokusy((p) => ({ ...p, [scenar.id]: novyPokus(scenar) })),
      vyber: (scenar, moznostId, h) => uloz(scenar, engineVyberMoznost(scenar, pokus(scenar), moznostId, h)),
      zadaj: (scenar, h) => uloz(scenar, engineZadajHodnotu(scenar, pokus(scenar), h)),
      vratSa: (scenar, index) => setPokusy((p) => ({ ...p, [scenar.id]: vratSaKuKroku(scenar, p[scenar.id] ?? novyPokus(scenar), index) })),
    }),
    [trening, pokus, dokoncene, uloz],
  );

  return <Kontext.Provider value={hodnota}>{children}</Kontext.Provider>;
}

export function useDemo(): DemoKontext {
  const k = useContext(Kontext);
  if (!k) throw new Error('useDemo sa musí použiť vnútri DemoProvider.');
  return k;
}
