import { useEffect, useRef, useState, type FormEvent } from 'react';
import { ArrowBendUpLeft, ArrowCounterClockwise, ArrowRight, FolderOpen } from '@phosphor-icons/react';
import type { Id, RozhodovaciUzol, Scenar } from '../data/types';
import { formatEur } from '../config/znacka';
import { POPIS_VERDIKTU, aktualnyUzol, moznostPodlaHodnoty, vyhodnot } from '../engine/pokus';
import { CESTY } from '../router';
import { Bloky } from './Bloky';
import { Podklady } from './Podklady';
import { Suhrn, ZoznamRozhodnuti } from './Suhrn';
import { useDemo } from './stav';

const PISMENA = ['A', 'B', 'C', 'D'];

/** Prvý podklad dôležitý pre uzol, ktorý nie je zároveň vložený priamo v príbehu. */
function preferovanyPodklad(uzol: RozhodovaciUzol): Id | undefined {
  const vlozene = new Set(uzol.pribeh.flatMap((b) => (b.typ === 'podklad' ? [b.podklad] : [])));
  return (uzol.podklady ?? []).find((p) => !vlozene.has(p)) ?? uzol.podklady?.[0];
}

/**
 * Prehrávač jedného scenára: zadanie, aktuálny uzol s rozhodnutím (alebo číselným vstupom),
 * doterajšie rozhodnutia s návratom a po závere súhrn. Podklady sú vedľa (desktop)
 * alebo za prepínačom priamo pod úvodom (mobil).
 */
export function Prehravac({ scenar, poradie, celkom, prva }: { scenar: Scenar; poradie: number; celkom: number; prva?: string }) {
  const demo = useDemo();
  const pokus = demo.pokus(scenar);
  const uzol = aktualnyUzol(scenar, pokus);
  const vyhodnotenie = vyhodnot(scenar, pokus);
  const predchadzajuci = demo.posledneDokoncene(scenar.id);
  const dalsi = demo.trening.scenare[poradie];
  const [podkladyOtvorene, setPodkladyOtvorene] = useState(false);
  const nadpisUzla = useRef<HTMLHeadingElement>(null);
  const prvaPouzita = useRef(false);

  // Vstup z náhľadu na predajnom webe: prvé rozhodnutie je už zvolené.
  useEffect(() => {
    if (!prva || prvaPouzita.current) return;
    prvaPouzita.current = true;
    if (pokus.kroky.length === 0 && uzol.typ === 'rozhodnutie' && uzol.moznosti.some((m) => m.id === prva)) {
      demo.vyber(scenar, prva);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prva]);

  // Po každom rozhodnutí presunieme fokus na nadpis nového uzla.
  useEffect(() => {
    if (pokus.kroky.length > 0) nadpisUzla.current?.focus();
  }, [pokus.aktualnyUzol, pokus.kroky.length]);

  const jeZaciatok = pokus.kroky.length === 0;

  return (
    <div className="prehravac">
      <div className="prehravac__uvod">
        <p className="postup">
          Situácia {poradie} z {celkom}: {demo.trening.znacka.nazovFirmy}
          {demo.trening.znacka.jeModelova && <span className="odznak odznak--model">vymyslená firma</span>}
        </p>
        <h1 className="prehravac__nadpis">{scenar.nazov}</h1>
        <p className="tlmeny">
          <strong>Čo sa precvičuje:</strong> {scenar.cvici}
        </p>

        {jeZaciatok && (
          <div className="zadanie">
            {scenar.zadanie.map((z, i) => (
              <p key={i}>{z}</p>
            ))}
            {demo.trening.upozornenie && <p className="upozornenie">{demo.trening.upozornenie}</p>}
            {predchadzajuci && (
              <aside className="predchadzajuci" aria-label="Predchádzajúci pokus">
                <strong>Predchádzajúci pokus</strong> ({POPIS_VERDIKTU[predchadzajuci.vyhodnotenie.verdikt].nadpis},{' '}
                {predchadzajuci.vyhodnotenie.pocty.spravne} správne na prvý pokus, {predchadzajuci.vyhodnotenie.pocty.opravene} opravené,{' '}
                {predchadzajuci.vyhodnotenie.pocty.nevyriesene} nevyriešené
                {predchadzajuci.vyhodnotenie.naklad > 0 ? `, modelový náklad ${formatEur(predchadzajuci.vyhodnotenie.naklad)}` : ''}).
                Nový pokus začína s čistým stavom.
              </aside>
            )}
          </div>
        )}

        <div className="podklady__prepinac bez-tlace">
          <button
            type="button"
            className="tlacidlo tlacidlo--jemne"
            aria-expanded={podkladyOtvorene}
            aria-controls={`podklady-${scenar.id}`}
            onClick={() => setPodkladyOtvorene((o) => !o)}
          >
            <FolderOpen size={18} weight="bold" aria-hidden="true" />
            {podkladyOtvorene ? 'Skryť podklady' : `Zobraziť podklady (${scenar.podklady.length})`}
          </button>
        </div>
      </div>

      <aside
        id={`podklady-${scenar.id}`}
        className={`prehravac__bok${podkladyOtvorene ? ' prehravac__bok--otvoreny' : ''}`}
        aria-label="Podklady k situácii"
      >
        <h2 className="prehravac__bok-nadpis">Podklady</h2>
        <p className="tlmeny male">Môžete sa k nim vracať pri každom rozhodnutí.</p>
        <Podklady
          podklady={scenar.podklady}
          dolezite={uzol.typ === 'rozhodnutie' ? uzol.podklady : []}
          preferovany={uzol.typ === 'rozhodnutie' ? preferovanyPodklad(uzol) : undefined}
          idPrefix={scenar.id}
        />
      </aside>

      <div className="prehravac__telo">
        {uzol.typ === 'zaver' ? (
          <Suhrn
            scenar={scenar}
            vyhodnotenie={vyhodnotenie}
            poradie={poradie}
            celkom={celkom}
            dalsi={dalsi}
            onZnova={() => demo.zacniOdznova(scenar)}
            onVratSa={(i) => demo.vratSa(scenar, i)}
          />
        ) : (
          <>
            <section
              className={`uzol${uzol.spatnaVazba ? ' uzol--spatna-vazba' : ''}`}
              aria-labelledby={`uzol-${uzol.id}`}
              aria-live="polite"
            >
              {uzol.spatnaVazba && (
                <p className="uzol__stitok">
                  <ArrowBendUpLeft size={16} weight="bold" aria-hidden="true" /> Spätná väzba na vaše rozhodnutie
                </p>
              )}
              <p className="uzol__cislo">Rozhodnutie č. {pokus.kroky.length + 1}</p>
              <h2 id={`uzol-${uzol.id}`} ref={nadpisUzla} tabIndex={-1} className="uzol__nadpis">
                {uzol.nadpis}
              </h2>
              <div className="uzol__pribeh">
                <Bloky bloky={uzol.pribeh} podklady={scenar.podklady} />
              </div>
              <Rozhodnutie uzol={uzol} scenar={scenar} />
            </section>

            {pokus.kroky.length > 0 && (
              <section className="doterajsie" aria-labelledby="doterajsie-nadpis">
                <h3 id="doterajsie-nadpis">Vaše doterajšie rozhodnutia</h3>
                <p className="tlmeny male">Ku ktorémukoľvek sa môžete vrátiť. Nasledujúce kroky sa z pokusu odstránia.</p>
                <ZoznamRozhodnuti vyhodnotenie={vyhodnotenie} onVratSa={(i) => demo.vratSa(scenar, i)} />
                <button type="button" className="tlacidlo tlacidlo--jemne tlacidlo--male" onClick={() => demo.zacniOdznova(scenar)}>
                  <ArrowCounterClockwise size={16} weight="bold" aria-hidden="true" />
                  Začať scenár odznova
                </button>
              </section>
            )}
          </>
        )}

        <p className="bez-tlace">
          <a href={CESTY.demo}>Späť na prehľad situácií</a>
        </p>
      </div>
    </div>
  );
}

function Rozhodnutie({ uzol, scenar }: { uzol: RozhodovaciUzol; scenar: Scenar }) {
  const demo = useDemo();
  const [hodnota, setHodnota] = useState('');
  const [chyba, setChyba] = useState<string | null>(null);

  // Nový uzol = prázdne pole.
  useEffect(() => {
    setHodnota('');
    setChyba(null);
  }, [uzol.id]);

  if (uzol.vstup) {
    const v = uzol.vstup;
    const cislo = hodnota.trim() === '' ? null : Number(hodnota);
    const platne = cislo !== null && Number.isFinite(cislo);
    const prepocet = v.prepocet && platne ? cislo * v.prepocet.nasobitel : null;
    const cena = v.prepocet?.cenaZaJednotku !== undefined && platne ? cislo * v.prepocet.cenaZaJednotku : null;

    const odosli = (e: FormEvent) => {
      e.preventDefault();
      if (!platne) {
        setChyba(`Zadajte číslo od ${v.min} do ${v.max}.`);
        return;
      }
      try {
        demo.zadaj(scenar, cislo);
      } catch (err) {
        setChyba(err instanceof Error ? err.message : 'Hodnotu sa nepodarilo použiť.');
      }
    };

    const idPola = `vstup-${uzol.id}`;
    const zodpoveda = platne ? moznostPodlaHodnoty(uzol, cislo) : undefined;

    return (
      <form className="vstup" onSubmit={odosli} noValidate>
        <p className="uloha">{uzol.uloha}</p>
        <label htmlFor={idPola} className="vstup__popis">
          {v.popis} ({v.jednotka})
        </label>
        <div className="vstup__riadok">
          <input
            id={idPola}
            name="mnozstvo"
            type="number"
            inputMode="numeric"
            autoComplete="off"
            min={v.min}
            max={v.max}
            step={v.krok ?? 1}
            value={hodnota}
            onChange={(e) => {
              setHodnota(e.target.value);
              setChyba(null);
            }}
            aria-describedby={`${idPola}-prepocet${chyba ? ` ${idPola}-chyba` : ''}`}
            aria-invalid={chyba ? true : undefined}
            className={chyba ? 'pole--chybne' : undefined}
          />
          <span className="vstup__jednotka">{v.jednotka}</span>
          <button type="submit" className="tlacidlo tlacidlo--hlavne">
            Pokračovať na rekapituláciu
            <span className="tlacidlo__ikona" aria-hidden="true">
              <ArrowRight size={16} weight="bold" />
            </span>
          </button>
        </div>
        <p id={`${idPola}-prepocet`} className="vstup__prepocet" aria-live="polite">
          {v.prepocet
            ? prepocet !== null
              ? `Prepočet: ${cislo} ${v.jednotka} = ${prepocet} ${v.prepocet.jednotkaVysledku}${cena !== null ? ` · ${formatEur(cena)}` : ''}`
              : `Prepočet: 1 ${v.jednotka} = ${v.prepocet.nasobitel} ${v.prepocet.jednotkaVysledku}${
                  v.prepocet.cenaZaJednotku !== undefined ? ` · ${formatEur(v.prepocet.cenaZaJednotku)} za ${v.jednotka}` : ''
                }`
            : ''}
        </p>
        {chyba && (
          <p id={`${idPola}-chyba`} className="pole__chyba" role="alert">
            {chyba}
          </p>
        )}
        {zodpoveda && <span className="visually-hidden">Zadaná hodnota bude použitá po potvrdení.</span>}
      </form>
    );
  }

  return (
    <div className="rozhodnutie" role="group" aria-labelledby={`uloha-${uzol.id}`}>
      <p id={`uloha-${uzol.id}`} className="uloha">
        {uzol.uloha}
      </p>
      <div className="moznosti">
        {uzol.moznosti.map((m, i) => (
          <button key={m.id} type="button" className="moznost" onClick={() => demo.vyber(scenar, m.id)}>
            <span className="moznost__pismeno" aria-hidden="true">
              {PISMENA[i] ?? String(i + 1)}
            </span>
            <span className="moznost__text">{m.text}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
