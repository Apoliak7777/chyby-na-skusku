import { ArrowRight, ListChecks } from '@phosphor-icons/react';
import { POPIS_VERDIKTU, vyhodnot } from '../engine/pokus';
import { CESTY } from '../router';
import { useDemo } from './stav';

/** Prehľad situácií tréningu so stavom pokusov. */
export function DemoDomov() {
  const demo = useDemo();
  const { trening } = demo;

  return (
    <div className="obal obal--uzky">
      <p className="postup">
        {trening.znacka.nazovFirmy}
        {trening.znacka.jeModelova && <span className="odznak odznak--model">vymyslená firma</span>}
      </p>
      <h1>{trening.nazov}</h1>
      <p className="uvod">
        Pozícia: <strong>{trening.pozicia}</strong>. Tri situácie, každá na 3 až 5 minút. Rozhodujete ako pracovník, vidíte
        následok a môžete sa vrátiť ku ktorémukoľvek rozhodnutiu.
      </p>
      {trening.znacka.jeModelova && (
        <p className="upozornenie">
          {trening.znacka.oznacenie}. {trening.upozornenie}
        </p>
      )}

      <ol className="situacie">
        {trening.scenare.map((s, i) => {
          const pokus = demo.pokus(s);
          const v = vyhodnot(s, pokus);
          const posledny = demo.posledneDokoncene(s.id);
          let stav: string;
          if (v.dokonceny) stav = `Dokončené: ${POPIS_VERDIKTU[v.verdikt].nadpis}`;
          else if (pokus.kroky.length > 0) stav = `Rozpracované (${pokus.kroky.length}. rozhodnutie)`;
          else if (posledny) stav = `Predchádzajúci pokus: ${POPIS_VERDIKTU[posledny.vyhodnotenie.verdikt].nadpis}`;
          else stav = 'Nezačaté';
          return (
            <li key={s.id} className="karta karta--situacia">
              <p className="postup">Situácia {i + 1} z {trening.scenare.length}</p>
              <h2>{s.nazov}</h2>
              <p>{s.strucnyProblem}</p>
              <p className="tlmeny male">
                Precvičuje: {s.cvici} {s.kontrolneBody.length} kontrolné body.
              </p>
              <p className="karta__stav">
                <span className="tlmeny">Stav:</span> {stav}
              </p>
              <a className="tlacidlo tlacidlo--hlavne" href={CESTY.scenar(s.id)}>
                {pokus.kroky.length > 0 && !v.dokonceny ? 'Pokračovať' : v.dokonceny ? 'Pozrieť súhrn' : 'Otvoriť situáciu'}
                <span className="tlacidlo__ikona" aria-hidden="true">
                  <ArrowRight size={16} weight="bold" />
                </span>
              </a>
            </li>
          );
        })}
      </ol>

      <p className="bez-tlace">
        <a className="tlacidlo tlacidlo--druhotne" href={CESTY.prehlad}>
          <ListChecks size={18} weight="bold" aria-hidden="true" />
          Prehľad celého tréningu (na tlač)
        </a>
      </p>
    </div>
  );
}
