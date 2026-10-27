import { useEffect, useRef, type ReactNode } from 'react';
import type { Icon } from '@phosphor-icons/react';
import { ArrowCounterClockwise, ArrowRight, CheckCircle, Circle, ListChecks, Printer, Warning, XCircle } from '@phosphor-icons/react';
import type { Blok, Scenar, ZaverecnyUzol } from '../data/types';
import { formatEur } from '../config/znacka';
import { POPIS_STAVU_KB, POPIS_VERDIKTU, najdiTypickuChybu, textMoznosti, type StavKB, type Verdikt, type Vyhodnotenie } from '../engine/pokus';
import { nezlomitelneMedzery } from '../engine/sadzba';
import { CESTY } from '../router';
import { BlokPreMajitela } from './BlokPreMajitela';
import { Bloky, Sadzba } from './Bloky';
import { useOdhalenie } from './pohyb';

const IKONA_STAVU: Record<StavKB, Icon> = {
  spravne: CheckCircle,
  opravene: ArrowCounterClockwise,
  nevyriesene: XCircle,
  otvorene: Circle,
};

const IKONA_VERDIKTU: Record<Verdikt, Icon> = {
  zvladnute: CheckCircle,
  'zvladnute-po-oprave': ArrowCounterClockwise,
  's-vyhradami': Warning,
  komplikacia: Warning,
  chyba: XCircle,
  rozpracovane: Circle,
};

export function Stav({ stav }: { stav: StavKB }) {
  const p = POPIS_STAVU_KB[stav];
  const Ikona = IKONA_STAVU[stav];
  return (
    <span className={`stav stav--${stav}`}>
      <Ikona size={15} weight="bold" aria-hidden="true" />
      {p.text}
    </span>
  );
}

/** Sumy v texte (napr. „45 €“) vysadí písmom pre čísla, zvyšok textu so slovenskou sadzbou. */
export function SoSumami({ text }: { text: string }) {
  const casti = text.split(/(\d[\d   ]*\s?€)/);
  return (
    <>
      {casti.map((c, i) =>
        i % 2 === 1 ? (
          <span key={i} className="suma">
            {nezlomitelneMedzery(c)}
          </span>
        ) : (
          <Sadzba key={i} text={c} />
        ),
      )}
    </>
  );
}

/**
 * Zbalené podrobnosti. Pri tlači sa rozbalia (aj pri Ctrl+P) a potom sa vrátia
 * do stavu, v akom ich mal používateľ.
 */
export function Podrobnosti({ nadpis, children }: { nadpis: string; children: ReactNode }) {
  const ref = useRef<HTMLDetailsElement>(null);
  useEffect(() => {
    let boloOtvorene = false;
    const predTlacou = () => {
      if (!ref.current) return;
      boloOtvorene = ref.current.open;
      ref.current.open = true;
    };
    const poTlaci = () => {
      if (ref.current) ref.current.open = boloOtvorene;
    };
    window.addEventListener('beforeprint', predTlacou);
    window.addEventListener('afterprint', poTlaci);
    return () => {
      window.removeEventListener('beforeprint', predTlacou);
      window.removeEventListener('afterprint', poTlaci);
    };
  }, []);
  return (
    <details ref={ref} className="podrobnosti">
      <summary className="podrobnosti__nadpis">{nadpis}</summary>
      <div className="podrobnosti__obsah">{children}</div>
    </details>
  );
}

/**
 * Tabuľka kontrolných bodov: používa sa v súhrne scenára aj v prehľade tréningu. Stĺpec
 * Výsledok má pevnú šírku, aby štítky v prehľade ladili pod sebou. Pod 600 px sa skladá do kariet.
 */
export function TabulkaBodov({ vyhodnotenie, sVysvetlenim = true }: { vyhodnotenie: Vyhodnotenie; sVysvetlenim?: boolean }) {
  return (
    <table className={`body-tabulka${sVysvetlenim ? ' body-tabulka--vysvetlenie' : ''}`}>
      <thead>
        <tr>
          <th scope="col" className="body-tabulka__bod">
            Kontrolný bod
          </th>
          <th scope="col" className="body-tabulka__vysledok">
            Výsledok
          </th>
          {sVysvetlenim && <th scope="col">Prečo na tom záleží</th>}
        </tr>
      </thead>
      <tbody>
        {vyhodnotenie.body.map((b) => (
          <tr key={b.id}>
            <th scope="row">
              <Sadzba text={b.nazov} />
            </th>
            <td data-stlpec="Výsledok">
              <Stav stav={b.stav} />
            </td>
            {sVysvetlenim && (
              <td data-stlpec="Prečo na tom záleží">
                <Sadzba text={b.vysvetlenie} />
                <span className="body-tabulka__zdroj">
                  {' '}
                  Zdroj: <Sadzba text={b.zdrojPravidla} />.
                </span>
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/** Zoznam rozhodnutí na aktuálnej ceste (voliteľne s návratom). */
export function ZoznamRozhodnuti({ vyhodnotenie, onVratSa }: { vyhodnotenie: Vyhodnotenie; onVratSa?: (index: number) => void }) {
  if (vyhodnotenie.cesta.length === 0) return <p className="tlmeny">Zatiaľ ste nerozhodli.</p>;
  return (
    <ol className="cesta">
      {vyhodnotenie.cesta.map((z, i) => (
        <li key={`${z.uzol}-${i}`} className="cesta__polozka">
          <div className="cesta__uzol">
            <span className="cesta__cislo">{z.poradie}.</span> <Sadzba text={z.nadpisUzla} />
          </div>
          <div className="cesta__volba">
            <Sadzba text={z.text} />
          </div>
          {z.nasledok && (
            <div className="cesta__nasledok">
              <Sadzba text={z.nasledok} />
            </div>
          )}
          {z.naklad !== undefined && z.naklad > 0 && (
            <div className="cesta__naklad">
              Náklad: <span className="suma">{formatEur(z.naklad)}</span> (modelová suma)
            </div>
          )}
          {onVratSa && (
            <button type="button" className="tlacidlo tlacidlo--jemne tlacidlo--male bez-tlace" onClick={() => onVratSa(i)}>
              <ArrowCounterClockwise size={16} weight="bold" aria-hidden="true" />
              Vrátiť sa k rozhodnutiu č. {z.poradie}
            </button>
          )}
        </li>
      ))}
    </ol>
  );
}

/** Prvý odsek záveru ide hore k verdiktu, zvyšok príbehu do podrobností. */
function rozdelPribeh(bloky: Blok[]): { veta?: string; zvysok: Blok[] } {
  const [prvy, ...ostatne] = bloky;
  if (!prvy || prvy.typ !== 'text' || prvy.text.length === 0) return { zvysok: bloky };
  const [veta, ...dalsie] = prvy.text;
  return { veta, zvysok: dalsie.length > 0 ? [{ typ: 'text', text: dalsie }, ...ostatne] : ostatne };
}

/**
 * Typická chyba nováčika v situácii a jej reťaz následkov. Odvodená z dát scenára
 * (typickaChyba a retazNasledku chybného záveru), ukazuje sa aj po bezchybnom pokuse.
 * Nehovorí nič o početnosti: firma je vymyslená a nikto nič nemeral.
 * S pohybom sa reťaz ukladá krok za krokom, až keď je v okne (na mobile býva pod prvou obrazovkou).
 */
function TypickaChyba({ scenar, zaver, sPohybom }: { scenar: Scenar; zaver: ZaverecnyUzol; sPohybom: boolean }) {
  const [retazRef, retazTrieda] = useOdhalenie<HTMLOListElement>(sPohybom);
  const typicka = najdiTypickuChybu(scenar);
  if (!typicka) return null;
  const retaz = typicka.zaver.retazNasledku ?? [];
  const id = `typicka-${scenar.id}`;
  return (
    <section className="typicka" aria-labelledby={id}>
      <h3 id={id} className="typicka__nadpis">
        Typická chyba nováčika v tejto situácii a čo spôsobí
      </h3>
      <p className="typicka__volba">
        <span className="typicka__stitok">Voľba</span> „<Sadzba text={textMoznosti(typicka.moznost)} />“
      </p>
      {retaz.length > 0 ? (
        <ol ref={retazRef} className={retazTrieda ? `retaz ${retazTrieda}` : 'retaz'} aria-label="Čo to spustí">
          {retaz.map((r, i) => (
            <li key={i} className="retaz__krok">
              <span className="retaz__text">
                <SoSumami text={r} />
              </span>
            </li>
          ))}
        </ol>
      ) : (
        <p>
          <Sadzba text={`${typicka.zaver.nadpis}.`} />
        </p>
      )}
      <p className="typicka__poznamka">
        {zaver.id === typicka.zaver.id ? 'Váš pokus skončil rovnako.' : <Sadzba text={`Koniec tohto postupu: ${typicka.zaver.nadpis}.`} />}
      </p>
    </section>
  );
}

export function Suhrn({
  scenar,
  vyhodnotenie,
  dalsi,
  predaj,
  sPohybom = false,
  onZnova,
  onVratSa,
}: {
  scenar: Scenar;
  vyhodnotenie: Vyhodnotenie;
  dalsi?: Scenar;
  /** Verejná ukážka: blok pre majiteľa a pokračovanie ako druhotná akcia. V klientskom tréningu false. */
  predaj: boolean;
  /** Súhrn vznikol posledným rozhodnutím: verdikt dopadne ako pečiatka a zvyšok príde v sérii (demo.css). */
  sPohybom?: boolean;
  onZnova: () => void;
  onVratSa: (index: number) => void;
}) {
  const zaver = vyhodnotenie.zaver;
  if (!zaver) return null;
  // __KLIENT__ je známe pri preklade: v klientskom builde sa blok pre majiteľa do JS vôbec nedostane.
  const JE_KLIENT = __KLIENT__ || !predaj;
  const verdikt = POPIS_VERDIKTU[vyhodnotenie.verdikt];
  const IkonaVerdiktu = IKONA_VERDIKTU[vyhodnotenie.verdikt];
  const { veta, zvysok } = rozdelPribeh(zaver.pribeh);
  const triedaPokracovania = JE_KLIENT ? 'tlacidlo tlacidlo--hlavne' : 'tlacidlo tlacidlo--druhotne';

  return (
    <section className={sPohybom ? 'suhrn suhrn--pohyb' : 'suhrn'} aria-labelledby="suhrn-nadpis">
      <div className={`verdikt verdikt--${vyhodnotenie.verdikt}`} role="status">
        <div className="verdikt__hlava">
          <span className="verdikt__znak" aria-hidden="true">
            <IkonaVerdiktu size={24} weight="bold" />
          </span>
          <h2 id="suhrn-nadpis" tabIndex={-1} className="verdikt__nadpis">
            {verdikt.nadpis}
          </h2>
        </div>
        <p className="verdikt__podnadpis">
          <Sadzba text={zaver.nadpis} />
        </p>
        {veta && (
          <p className="verdikt__veta">
            <SoSumami text={veta} />
          </p>
        )}
        {vyhodnotenie.naklad > 0 && (
          <p className="verdikt__naklad">
            Náklad tohto postupu: <span className="suma">{formatEur(vyhodnotenie.naklad)}</span> (modelová suma)
          </p>
        )}
      </div>

      {!JE_KLIENT && <BlokPreMajitela hlavny={!dalsi} idPrefix={`suhrn-${scenar.id}`} />}

      <TypickaChyba scenar={scenar} zaver={zaver} sPohybom={sPohybom} />

      <h3>Čo rozhodlo</h3>
      <ul className="vysvetlenie">
        {zaver.vysvetlenie.map((v, i) => (
          <li key={i}>
            <Sadzba text={v} />
          </li>
        ))}
      </ul>

      <div className="suhrn__akcie bez-tlace">
        {dalsi ? (
          <a className={triedaPokracovania} href={CESTY.scenar(dalsi.id)}>
            Ďalšia situácia: {dalsi.nazov}
            <span className="tlacidlo__ikona" aria-hidden="true">
              <ArrowRight size={16} weight="bold" />
            </span>
          </a>
        ) : (
          <a className={triedaPokracovania} href={CESTY.prehlad}>
            <ListChecks size={18} weight="bold" aria-hidden="true" />
            Prehľad celého tréningu
          </a>
        )}
        <button type="button" className="tlacidlo tlacidlo--jemne" onClick={onZnova}>
          <ArrowCounterClockwise size={18} weight="bold" aria-hidden="true" />
          Skúsiť situáciu znova
        </button>
        <button type="button" className="tlacidlo tlacidlo--jemne" onClick={() => window.print()}>
          <Printer size={18} weight="bold" aria-hidden="true" />
          Vytlačiť alebo uložiť ako PDF
        </button>
      </div>

      <Podrobnosti nadpis="Podrobnosti pre vedúceho">
        {zvysok.length > 0 && (
          <div className="suhrn__pribeh">
            <Bloky bloky={zvysok} podklady={scenar.podklady} />
          </div>
        )}
        <p className="tlmeny male">Precvičuje: {scenar.cvici}</p>
        <h3>Kontrolné body</h3>
        <p className="tlmeny male">
          Každý bod je splnený na prvý pokus, opravený po spätnej väzbe alebo nevyriešený. Ukazuje, čo si precvičiť.
        </p>
        <TabulkaBodov vyhodnotenie={vyhodnotenie} />
        <h3>Rozhodnutia v tomto pokuse</h3>
        <ZoznamRozhodnuti vyhodnotenie={vyhodnotenie} onVratSa={onVratSa} />
      </Podrobnosti>
    </section>
  );
}
