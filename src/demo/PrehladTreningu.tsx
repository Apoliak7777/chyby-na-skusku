import { useState } from 'react';
import { Printer } from '@phosphor-icons/react';
import type { Scenar } from '../data/types';
import { formatEur } from '../config/znacka';
import { POPIS_VERDIKTU, vyhodnot, type Verdikt, type Vyhodnotenie } from '../engine/pokus';
import { nezlomitelneMedzery } from '../engine/sadzba';
import { CESTY } from '../router';
import { BlokPreMajitela } from './BlokPreMajitela';
import { Sadzba } from './Bloky';
import { Podrobnosti, TabulkaBodov, ZoznamRozhodnuti } from './Suhrn';
import { useDemo } from './stav';

const ZVLADNUTE: Verdikt[] = ['zvladnute', 'zvladnute-po-oprave'];

interface VysledokSituacie {
  scenar: Scenar;
  poradie: number;
  vyhodnotenie?: Vyhodnotenie;
  /** Zobrazuje sa predchádzajúci dokončený pokus, nový je rozpracovaný. */
  starsi: boolean;
}

/** Dátum a čas stavu bez zalomenia v dátume („26. 10. 2026, 7:50“). */
function datumStavu(datum: Date): string {
  const text = new Intl.DateTimeFormat('sk-SK', { dateStyle: 'medium', timeStyle: 'short' }).format(datum);
  return nezlomitelneMedzery(text.replace(/\s+(?=\d)/g, ' '));
}

/** Bod v zozname záveru: názov bodu, pod ním situácia (bez zátvoriek v zátvorkách). */
function BodZaveru({ nazov, x }: { nazov: string; x: VysledokSituacie }) {
  return (
    <li>
      <Sadzba text={nazov} />
      <span className="zaver-prehladu__situacia">
        Situácia {x.poradie}: {x.scenar.nazov}
      </span>
    </li>
  );
}

/** Automatický záver z výsledkov: koľko je hotové a ktoré kontrolné body treba s pracovníkom prebrať. */
function ZaverPrehladu({ vysledky }: { vysledky: VysledokSituacie[] }) {
  const dokoncene = vysledky.filter((x) => x.vyhodnotenie);
  const nevyriesene = dokoncene.flatMap((x) => (x.vyhodnotenie?.body ?? []).filter((b) => b.stav === 'nevyriesene').map((b) => ({ x, b })));
  const opravene = dokoncene.flatMap((x) => (x.vyhodnotenie?.body ?? []).filter((b) => b.stav === 'opravene').map((b) => ({ x, b })));
  const zvladnute = dokoncene.filter((x) => x.vyhodnotenie && ZVLADNUTE.includes(x.vyhodnotenie.verdikt)).length;
  const prva = vysledky[0];

  return (
    <section className="zaver-prehladu" aria-labelledby="zaver-prehladu-nadpis">
      <h2 id="zaver-prehladu-nadpis" className="zaver-prehladu__nadpis">
        Záver
      </h2>
      {dokoncene.length === 0 ? (
        <p>
          Zatiaľ nie je dokončená žiadna situácia. Záver sa doplní sám po prvej dokončenej situácii.
          {prva && (
            <>
              {' '}
              <a className="bez-tlace" href={CESTY.scenar(prva.scenar.id)}>
                Otvoriť situáciu {prva.poradie}: {prva.scenar.nazov}
              </a>
            </>
          )}
        </p>
      ) : (
        <>
          <dl className="zaver-prehladu__cisla">
            <div>
              <dt>Dokončené situácie</dt>
              <dd>
                {dokoncene.length} z{' '}
                {vysledky.length}
              </dd>
            </div>
            <div>
              <dt>Zvládnuté</dt>
              <dd>{zvladnute}</dd>
            </div>
            <div>
              <dt>Nevyriešené body</dt>
              <dd>{nevyriesene.length}</dd>
            </div>
          </dl>
          {nevyriesene.length > 0 ? (
            <>
              <h3>Prebrať s pracovníkom</h3>
              <ul className="zaver-prehladu__body">
                {nevyriesene.map(({ x, b }) => (
                  <BodZaveru key={`${x.scenar.id}-${b.id}`} nazov={b.nazov} x={x} />
                ))}
              </ul>
            </>
          ) : (
            <p>V dokončených situáciách neostal nevyriešený žiadny kontrolný bod.</p>
          )}
          {opravene.length > 0 && (
            <>
              <h3>Stačí pripomenúť (opravil po spätnej väzbe)</h3>
              <ul className="zaver-prehladu__body">
                {opravene.map(({ x, b }) => (
                  <BodZaveru key={`${x.scenar.id}-${b.id}`} nazov={b.nazov} x={x} />
                ))}
              </ul>
            </>
          )}
        </>
      )}
    </section>
  );
}

/** „Čo uvidí vedúci“: prehľad celého tréningu na tlač alebo uloženie do PDF, posledný dokončený pokus každej situácie. */
export function PrehladTreningu() {
  const demo = useDemo();
  const { trening } = demo;
  // Predajný obsah len vo verejnej ukážke. __KLIENT__ je známe pri preklade, v klientskom builde je to mŕtvy kód.
  const JE_KLIENT = __KLIENT__ || trening.rezim === 'klient';
  const [meno, setMeno] = useState('');
  const datum = datumStavu(new Date());

  const vysledky: VysledokSituacie[] = trening.scenare.map((s, i) => {
    const aktualneV = vyhodnot(s, demo.pokus(s));
    const posledny = demo.posledneDokoncene(s.id);
    const vyhodnotenie = aktualneV.dokonceny ? aktualneV : posledny?.vyhodnotenie;
    return { scenar: s, poradie: i + 1, ...(vyhodnotenie ? { vyhodnotenie } : {}), starsi: !aktualneV.dokonceny && Boolean(posledny) };
  });
  const nieCoDokoncene = vysledky.some((x) => x.vyhodnotenie);

  return (
    <div className="obal obal--uzky prehlad">
      <p className="postup">
        {trening.znacka.nazovFirmy}
        {trening.znacka.jeModelova && <span className="odznak">vymyslená firma</span>}
      </p>
      <h1>Čo uvidí vedúci</h1>
      <p className="tlmeny">
        {trening.nazov}. {trening.pozicia}. Stav k{' '}
        <span className="bez-zlomu">{datum}</span>.
      </p>
      <p className="prehlad__ako bez-tlace">
        Nový človek si na konci súhrn vytlačí alebo uloží ako PDF a pošle vám ho. Tréning sám nič neukladá ani neposiela.
      </p>
      <p className="prehlad__pracovnik len-tlac">Pracovník: {meno.trim() || '______________________'}</p>

      <ZaverPrehladu vysledky={vysledky} />

      {/* Výzva pre majiteľa až po prvej dokončenej situácii, nie na prázdnom prehľade. */}
      {!JE_KLIENT && nieCoDokoncene && <BlokPreMajitela uroven="h2" idPrefix="prehlad" />}

      <div className="prehlad__nastroje bez-tlace">
        <div className="prehlad__meno">
          <label htmlFor="meno-pracovnika">Meno pracovníka (len na výtlačok, nikam sa neposiela)</label>
          <input id="meno-pracovnika" type="text" autoComplete="off" value={meno} onChange={(e) => setMeno(e.target.value)} />
        </div>
        <button type="button" className="tlacidlo tlacidlo--druhotne" onClick={() => window.print()}>
          <Printer size={18} weight="bold" aria-hidden="true" />
          Vytlačiť alebo uložiť ako PDF
        </button>
      </div>

      {vysledky.map(({ scenar: s, poradie, vyhodnotenie: zobrazene, starsi }) => (
        <section key={s.id} className="prehlad__scenar" aria-labelledby={`prehlad-${s.id}`}>
          <p className="postup">
            Situácia {poradie} z{' '}
            {trening.scenare.length}
          </p>
          <h2 id={`prehlad-${s.id}`}>
            <Sadzba text={s.nazov} />
          </h2>
          <p className="tlmeny male">Precvičuje: {s.cvici}</p>
          {!zobrazene ? (
            <p>
              Zatiaľ nedokončené.{' '}
              <a className="bez-tlace" href={CESTY.scenar(s.id)}>
                Otvoriť situáciu
              </a>
            </p>
          ) : (
            <>
              <p className={`prehlad__vysledok prehlad__vysledok--${zobrazene.verdikt}`}>
                <strong>Výsledok: {POPIS_VERDIKTU[zobrazene.verdikt].nadpis}</strong>
                {zobrazene.zaver ? (
                  <>
                    , <Sadzba text={zobrazene.zaver.nadpis} />
                  </>
                ) : null}
                {zobrazene.naklad > 0 && (
                  <>
                    , náklad <span className="suma">{formatEur(zobrazene.naklad)}</span> (modelová suma)
                  </>
                )}
                {starsi ? '. Zobrazený je predchádzajúci dokončený pokus, nový je rozpracovaný.' : ''}
              </p>
              <TabulkaBodov vyhodnotenie={zobrazene} sVysvetlenim={false} />
              <Podrobnosti nadpis="Rozhodnutia v pokuse">
                <ZoznamRozhodnuti vyhodnotenie={zobrazene} />
              </Podrobnosti>
            </>
          )}
        </section>
      ))}
    </div>
  );
}
