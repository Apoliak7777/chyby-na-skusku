import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { Circle } from '@phosphor-icons/react';
import type { Id, Podklad } from '../data/types';
import { Bloky, IkonaPodkladu } from './Bloky';

/**
 * Panel podkladov ako záložky (tablist). Podklady dôležité pre aktuálny krok sú označené
 * textom aj značkou, nie iba farbou. Ovládanie klávesnicou: šípky, Home, End.
 */
export function Podklady({
  podklady,
  dolezite = [],
  preferovany,
  idPrefix,
}: {
  podklady: Podklad[];
  dolezite?: Id[];
  /** Podklad, ktorý sa otvorí ako prvý (napr. ten dôležitý pre aktuálny krok). */
  preferovany?: Id;
  idPrefix: string;
}) {
  const [aktivny, setAktivny] = useState<Id | undefined>(preferovany ?? podklady[0]?.id);
  const tlacidla = useRef<Map<Id, HTMLButtonElement>>(new Map());

  useEffect(() => {
    if (aktivny && !podklady.some((p) => p.id === aktivny)) setAktivny(podklady[0]?.id);
  }, [podklady, aktivny]);

  const presun = (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const posledny = podklady.length - 1;
    let novy: number | null = null;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') novy = index === posledny ? 0 : index + 1;
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') novy = index === 0 ? posledny : index - 1;
    else if (e.key === 'Home') novy = 0;
    else if (e.key === 'End') novy = posledny;
    if (novy === null) return;
    e.preventDefault();
    const cielovy = podklady[novy];
    if (!cielovy) return;
    setAktivny(cielovy.id);
    tlacidla.current.get(cielovy.id)?.focus();
  };

  if (podklady.length === 0) return null;

  return (
    <div className="podklady">
      <div role="tablist" aria-label="Podklady k situácii" className="podklady__zalozky">
        {podklady.map((p, i) => {
          const jeDolezity = dolezite.includes(p.id);
          const vybrany = p.id === aktivny;
          return (
            <button
              key={p.id}
              type="button"
              role="tab"
              id={`${idPrefix}-zalozka-${p.id}`}
              aria-selected={vybrany}
              aria-controls={`${idPrefix}-panel-${p.id}`}
              tabIndex={vybrany ? 0 : -1}
              className={`podklady__zalozka${jeDolezity ? ' podklady__zalozka--dolezita' : ''}`}
              onClick={() => setAktivny(p.id)}
              onKeyDown={(e) => presun(e, i)}
              ref={(el) => {
                if (el) tlacidla.current.set(p.id, el);
                else tlacidla.current.delete(p.id);
              }}
            >
              <IkonaPodkladu druh={p.druh} size={16} />
              <span>{p.nazov}</span>
              {jeDolezity && (
                <span className="podklady__znacka">
                  <Circle size={8} weight="fill" aria-hidden="true" />
                  <span className="visually-hidden">, dôležité pre tento krok</span>
                </span>
              )}
            </button>
          );
        })}
      </div>
      {podklady.map((p) => (
        <div
          key={p.id}
          role="tabpanel"
          id={`${idPrefix}-panel-${p.id}`}
          aria-labelledby={`${idPrefix}-zalozka-${p.id}`}
          hidden={p.id !== aktivny}
          tabIndex={0}
          className="podklady__panel"
        >
          {dolezite.includes(p.id) && <p className="podklady__poznamka">Tento podklad je dôležitý pre aktuálny krok.</p>}
          <Bloky bloky={p.bloky} podklady={podklady} />
        </div>
      ))}
    </div>
  );
}
