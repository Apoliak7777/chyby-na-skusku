import { ArrowRight, ListChecks } from '@phosphor-icons/react';
import { POPIS_VERDIKTU, odhadTrvania, vyhodnot } from '../engine/pokus';
import { CESTY } from '../router';
import { Sadzba } from './Bloky';
import { useDemo } from './stav';

/** „asi 3 minúty“, „asi 5 minút“: tvar podľa počtu. */
function minuty(n: number): string {
  if (n === 1) return 'asi 1 minútu';
  if (n >= 2 && n <= 4) return `asi ${n} minúty`;
  return `asi ${n} minút`;
}

/** Prehľad situácií tréningu so stavom pokusov. */
export function DemoDomov() {
  const demo = useDemo();
  const { trening } = demo;
  // Predajný obsah len vo verejnej ukážke. __KLIENT__ je známe pri preklade, v klientskom builde je to mŕtvy kód.
  const JE_KLIENT = __KLIENT__ || trening.rezim === 'klient';
  const prva = trening.scenare[0];
  const ostatne = trening.scenare.length - 1;

  return (
    <div className="obal obal--uzky domov">
      <p className="postup">
        {trening.znacka.nazovFirmy}
        {trening.znacka.jeModelova && <span className="odznak">vymyslená firma</span>}
      </p>
      <h1>{trening.nazov}</h1>
      <p className="uvod">
        Rozhodujete ako nový človek na príjme objednávok, hneď vidíte následok a ku každému rozhodnutiu sa môžete vrátiť.
        {prva && !JE_KLIENT && ostatne > 0 && (
          <>
            {' '}
            Prvá situácia trvá {minuty(odhadTrvania(prva).minuty)},{' '}
            {ostatne === 1 ? 'druhá je nepovinná' : ostatne === 2 ? 'ďalšie dve sú nepovinné' : 'ďalšie sú nepovinné'}.
          </>
        )}
      </p>
      {!JE_KLIENT && <p className="uvod domov__u-vas">U vás by to boli vaše produkty a vaše pravidlá.</p>}

      <ol className="situacie">
        {trening.scenare.map((s, i) => {
          const pokus = demo.pokus(s);
          const v = vyhodnot(s, pokus);
          const posledny = demo.posledneDokoncene(s.id);
          let stav: string;
          if (v.dokonceny) stav = POPIS_VERDIKTU[v.verdikt].nadpis;
          else if (pokus.kroky.length > 0) stav = `Rozpracované (${pokus.kroky.length}. rozhodnutie)`;
          else if (posledny) stav = `Predchádzajúci pokus: ${POPIS_VERDIKTU[posledny.vyhodnotenie.verdikt].nadpis}`;
          else stav = 'Nezačaté';
          return (
            <li key={s.id} className={`karta karta--situacia${i === 0 ? ' karta--prva' : ''}`}>
              <p className="karta__hlava">
                <span className="postup">
                  Situácia {i + 1} z{' '}
                  {trening.scenare.length}
                </span>
                {i === 0 && <span className="stitok-zacnite">Začnite tu</span>}
                <span className="karta__cas">{minuty(odhadTrvania(s).minuty)}</span>
              </p>
              <h2>
                <Sadzba text={s.nazov} />
              </h2>
              <p>
                <Sadzba text={s.strucnyProblem} />
              </p>
              <p className="karta__stav">
                <span className="tlmeny">Stav:</span> {stav}
              </p>
              <a className={`tlacidlo ${i === 0 ? 'tlacidlo--hlavne' : 'tlacidlo--druhotne'}`} href={CESTY.scenar(s.id)}>
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
          Čo uvidí vedúci
        </a>
      </p>
      {trening.upozornenie && <p className="domov__poznamka">{trening.upozornenie}</p>}
    </div>
  );
}
