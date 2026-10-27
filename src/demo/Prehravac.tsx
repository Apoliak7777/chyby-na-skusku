import { useEffect, useLayoutEffect, useRef, useState, type FormEvent } from 'react';
import { ArrowBendUpLeft, ArrowCounterClockwise, ArrowRight, FolderOpen } from '@phosphor-icons/react';
import type { Blok, Id, RozhodovaciUzol, Scenar } from '../data/types';
import { formatEur } from '../config/znacka';
import { POPIS_VERDIKTU, aktualnyUzol, moznostPodlaHodnoty, najdiUzol, vyhodnot } from '../engine/pokus';
import { CESTY } from '../router';
import { Bloky, Sadzba } from './Bloky';
import { Podklady } from './Podklady';
import { usePoZmene } from './pohyb';
import { Suhrn, ZoznamRozhodnuti } from './Suhrn';
import { useDemo } from './stav';

const PISMENA = ['A', 'B', 'C', 'D'];

function vlozenePodklady(bloky: Blok[]): Id[] {
  return bloky.flatMap((b) => (b.typ === 'podklad' ? [b.podklad] : []));
}

/**
 * Podklad, ktorý sa v paneli otvorí pri novom kroku: prvý dôležitý, ktorý nie je vložený
 * priamo v príbehu. Ak taký nie je, panel nič nevnucuje (pri prvom kroku situácie 1 tak
 * neprezradí skladový prehľad s voľnou zásobou).
 */
function preferovanyPodklad(uzol: RozhodovaciUzol): Id | undefined {
  const vlozene = new Set(vlozenePodklady(uzol.pribeh));
  return (uzol.podklady ?? []).find((p) => !vlozene.has(p));
}

/**
 * Posunie stránku na nový krok (alebo súhrn) a presunie fokus na jeho nadpis. Ak je titul
 * situácie hneď nad krokom, posunie sa na titul: pod lepkavou hlavičkou tak neostane napoly
 * schovaný ani nadpis H1, ani nadpis kroku (odsadenie dáva scroll-margin-top v demo.css).
 * Posúva sa len vtedy, keď by začiatok bol pod hlavičkou alebo príliš nízko.
 */
function presunNa(nadpis: HTMLElement | null, uvod: HTMLElement | null) {
  if (!nadpis) return;
  nadpis.focus({ preventScroll: true });
  const blok = nadpis.closest('section') ?? nadpis;
  const hornyOkraj = parseFloat(getComputedStyle(blok).scrollMarginTop) || 0;
  const titulBlizko = uvod !== null && blok.getBoundingClientRect().top - uvod.getBoundingClientRect().top < window.innerHeight * 0.4;
  const ciel = titulBlizko && uvod ? uvod : blok;
  const hore = ciel.getBoundingClientRect().top;
  if (hore < hornyOkraj || blok.getBoundingClientRect().top > window.innerHeight * 0.45) ciel.scrollIntoView({ block: 'start' });
}

/**
 * Značka tohto načítania stránky v history.state: voľba z adresy (?prva=) sa použije raz.
 * Pri návrate tlačidlom Späť sa nepoužije znova; po obnovení stránky áno (stav je len v pamäti).
 */
const NACITANIE = Math.random().toString(36).slice(2);

function prvaUzPouzita(): boolean {
  const stav: unknown = window.history.state;
  return typeof stav === 'object' && stav !== null && (stav as { prva?: unknown }).prva === NACITANIE;
}

function oznacPrvuAkoPouzitu() {
  const stav: unknown = window.history.state;
  window.history.replaceState({ ...(typeof stav === 'object' && stav !== null ? stav : {}), prva: NACITANIE }, '');
}

/**
 * Prehrávač jedného scenára: krátke zadanie, aktuálny uzol s rozhodnutím (alebo číselným vstupom),
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
  // Predajný obsah len vo verejnej ukážke. __KLIENT__ je známe pri preklade, v klientskom builde je to mŕtvy kód.
  const JE_KLIENT = __KLIENT__ || demo.trening.rezim === 'klient';
  const [podkladyOtvorene, setPodkladyOtvorene] = useState(false);
  const nadpisUzla = useRef<HTMLHeadingElement>(null);
  const uvod = useRef<HTMLDivElement>(null);
  // Uzol z otvorenia situácie sa ukáže hneď, každý ďalší (aj súhrn) s pohybom podľa demo.css.
  const sPohybom = usePoZmene(uzol.id);

  // Vstup z náhľadu na predajnom webe: prvé rozhodnutie je už zvolené. Ak má situácia pokus,
  // ktorý začal inou voľbou (aj dokončený), začne sa čistý pokus s voľbou z adresy.
  // Ešte pred prvým vykreslením na obrazovku: úvodný krok so zadaním sa neukáže a obsah neposkočí.
  useLayoutEffect(() => {
    if (!prva || prvaUzPouzita()) return;
    oznacPrvuAkoPouzitu();
    const start = najdiUzol(scenar, scenar.vstupnyUzol);
    if (start.typ !== 'rozhodnutie' || !start.moznosti.some((m) => m.id === prva)) return;
    if (pokus.kroky[0]?.moznost !== prva) demo.zacniSVolbou(scenar, prva);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prva]);

  // Po každom rozhodnutí fokus na nadpis nového uzla, po poslednom na verdikt súhrnu.
  useEffect(() => {
    if (pokus.kroky.length === 0) return;
    presunNa(uzol.typ === 'zaver' ? document.getElementById('suhrn-nadpis') : nadpisUzla.current, uvod.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pokus.aktualnyUzol, pokus.kroky.length]);

  const jeZaciatok = pokus.kroky.length === 0;

  return (
    <div className="prehravac">
      <div className="prehravac__uvod" ref={uvod}>
        <p className="postup">
          Situácia {poradie} z{' '}
          {celkom}: {demo.trening.znacka.nazovFirmy}
          {demo.trening.znacka.jeModelova && <span className="odznak">vymyslená firma</span>}
        </p>
        <div className="prehravac__titul">
          <h1 className="prehravac__nadpis">
            <Sadzba text={scenar.nazov} />
          </h1>
          <button
            type="button"
            className="tlacidlo tlacidlo--jemne tlacidlo--male podklady__prepinac bez-tlace"
            aria-expanded={podkladyOtvorene}
            aria-controls={`podklady-${scenar.id}`}
            onClick={() => setPodkladyOtvorene((o) => !o)}
          >
            <FolderOpen size={17} weight="bold" aria-hidden="true" />
            {podkladyOtvorene ? 'Skryť podklady' : `Podklady (${scenar.podklady.length})`}
          </button>
        </div>

        {jeZaciatok && (
          <div className="zadanie">
            {scenar.zadanie.map((z, i) => (
              <p key={i}>
                <Sadzba text={z} />
              </p>
            ))}
            {predchadzajuci && (
              <aside className="predchadzajuci" aria-label="Predchádzajúci pokus">
                <strong>Predchádzajúci pokus:</strong> {POPIS_VERDIKTU[predchadzajuci.vyhodnotenie.verdikt].nadpis}. Body: správne na prvý pokus{' '}
                {predchadzajuci.vyhodnotenie.pocty.spravne}, opravené {predchadzajuci.vyhodnotenie.pocty.opravene}, nevyriešené{' '}
                {predchadzajuci.vyhodnotenie.pocty.nevyriesene}.
                {predchadzajuci.vyhodnotenie.naklad > 0 ? ` Náklad ${formatEur(predchadzajuci.vyhodnotenie.naklad)} (modelová suma).` : ''} Nový
                pokus začína s čistým stavom.
              </aside>
            )}
          </div>
        )}
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
          vlozene={uzol.typ === 'rozhodnutie' ? vlozenePodklady(uzol.pribeh) : []}
          preferovany={uzol.typ === 'rozhodnutie' ? preferovanyPodklad(uzol) : scenar.podklady.find((p) => p.druh === 'pravidla')?.id}
          kluc={uzol.id}
          idPrefix={scenar.id}
        />
      </aside>

      <div className="prehravac__telo">
        {uzol.typ === 'zaver' ? (
          <Suhrn
            scenar={scenar}
            vyhodnotenie={vyhodnotenie}
            dalsi={dalsi}
            predaj={!JE_KLIENT}
            sPohybom={sPohybom}
            onZnova={() => demo.zacniOdznova(scenar)}
            onVratSa={(i) => demo.vratSa(scenar, i)}
          />
        ) : (
          <>
            {/* Bez aria-live: zmenu kroku ohlási presun fokusu na nadpis, celý príbeh sa nečíta dvakrát.
                Kľúč podľa uzla: nový krok je nový prvok, jeho vstupná animácia sa spustí raz a nezopakuje sa
                pri inom prekreslení (napr. otvorení podkladov). Karta sama stojí, hýbe sa len jej obsah. */}
            <section
              key={uzol.id}
              className={`uzol${uzol.spatnaVazba ? ' uzol--spatna-vazba' : ''}${sPohybom ? ' uzol--pohyb' : ''}`}
              aria-labelledby={`uzol-${uzol.id}`}
            >
              {uzol.spatnaVazba && (
                <p className="uzol__stitok">
                  <ArrowBendUpLeft size={15} weight="bold" aria-hidden="true" /> Spätná väzba na vaše rozhodnutie
                </p>
              )}
              <p className="uzol__cislo">Rozhodnutie č.{' '}{pokus.kroky.length + 1}</p>
              <h2 id={`uzol-${uzol.id}`} ref={nadpisUzla} tabIndex={-1} className="uzol__nadpis">
                <Sadzba text={uzol.nadpis} />
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
                  Začať situáciu odznova
                </button>
              </section>
            )}
          </>
        )}

        <p className="prehravac__spat bez-tlace">
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
        <p className="uloha">
          <Sadzba text={uzol.uloha} />
        </p>
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
        <Sadzba text={uzol.uloha} />
      </p>
      <div className="moznosti">
        {uzol.moznosti.map((m, i) => (
          <button key={m.id} type="button" className="moznost" onClick={() => demo.vyber(scenar, m.id)}>
            <span className="moznost__pismeno" aria-hidden="true">
              {PISMENA[i] ?? String(i + 1)}
            </span>
            <span className="moznost__text">
              <Sadzba text={m.text} />
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
