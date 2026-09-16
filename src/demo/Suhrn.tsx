import type { Icon } from '@phosphor-icons/react';
import { ArrowCounterClockwise, ArrowRight, CheckCircle, Circle, ListChecks, Printer, Warning, XCircle } from '@phosphor-icons/react';
import type { Scenar } from '../data/types';
import { formatEur } from '../config/znacka';
import { POPIS_STAVU_KB, POPIS_VERDIKTU, type StavKB, type Verdikt, type Vyhodnotenie } from '../engine/pokus';
import { CESTY } from '../router';
import { Bloky } from './Bloky';

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
      <Ikona size={16} weight="bold" aria-hidden="true" />
      {p.text}
    </span>
  );
}

/** Tabuľka kontrolných bodov: používa sa v súhrne scenára aj v prehľade tréningu. */
export function TabulkaBodov({ vyhodnotenie, sVysvetlenim = true }: { vyhodnotenie: Vyhodnotenie; sVysvetlenim?: boolean }) {
  return (
    <table className="body-tabulka">
      <thead>
        <tr>
          <th scope="col">Kontrolný bod</th>
          <th scope="col">Výsledok</th>
          {sVysvetlenim && <th scope="col">Prečo na tom záleží</th>}
        </tr>
      </thead>
      <tbody>
        {vyhodnotenie.body.map((b) => (
          <tr key={b.id}>
            <th scope="row">{b.nazov}</th>
            <td>
              <Stav stav={b.stav} />
            </td>
            {sVysvetlenim && (
              <td>
                {b.vysvetlenie}
                <span className="tlmeny male"> Zdroj: {b.zdrojPravidla}.</span>
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
          <div className="cesta__uzol">{z.nadpisUzla}</div>
          <div className="cesta__volba">{z.text}</div>
          {z.nasledok && <div className="cesta__nasledok">{z.nasledok}</div>}
          {z.naklad !== undefined && z.naklad > 0 && (
            <div className="cesta__naklad">Modelový náklad tejto voľby: {formatEur(z.naklad)}</div>
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

export function Suhrn({
  scenar,
  vyhodnotenie,
  poradie,
  celkom,
  dalsi,
  onZnova,
  onVratSa,
}: {
  scenar: Scenar;
  vyhodnotenie: Vyhodnotenie;
  poradie: number;
  celkom: number;
  dalsi?: Scenar;
  onZnova: () => void;
  onVratSa: (index: number) => void;
}) {
  const zaver = vyhodnotenie.zaver;
  if (!zaver) return null;
  const verdikt = POPIS_VERDIKTU[vyhodnotenie.verdikt];
  const IkonaVerdiktu = IKONA_VERDIKTU[vyhodnotenie.verdikt];

  return (
    <section className="suhrn" aria-labelledby="suhrn-nadpis">
      <p className="postup">
        Situácia {poradie} z {celkom}: {scenar.nazov}, súhrn pokusu
      </p>
      <div className={`verdikt verdikt--${vyhodnotenie.verdikt}`} role="status">
        <span className="verdikt__znak" aria-hidden="true">
          <IkonaVerdiktu size={26} weight="bold" />
        </span>
        <div>
          <h2 id="suhrn-nadpis">{verdikt.nadpis}</h2>
          <p className="verdikt__podnadpis">{zaver.nadpis}</p>
        </div>
      </div>

      <div className="suhrn__pribeh">
        <Bloky bloky={zaver.pribeh} podklady={scenar.podklady} />
      </div>

      {vyhodnotenie.naklad > 0 && (
        <p className="naklad">
          <strong>Modelový následok tejto vetvy: {formatEur(vyhodnotenie.naklad)}.</strong> Ilustračná suma z pravidiel ukážky, nie
          nameraná úspora ani skutočný cenník.
        </p>
      )}

      <h3>Čo rozhodlo</h3>
      <ul className="vysvetlenie">
        {zaver.vysvetlenie.map((v, i) => (
          <li key={i}>{v}</li>
        ))}
      </ul>

      <h3>Kontrolné body</h3>
      <p className="tlmeny male">
        Správne na prvý pokus, opravené po spätnej väzbe, nevyriešené. Toto nie je certifikácia. Ukazuje, čo si precvičiť.
      </p>
      <TabulkaBodov vyhodnotenie={vyhodnotenie} />

      <h3>Vaše rozhodnutia v tomto pokuse</h3>
      <ZoznamRozhodnuti vyhodnotenie={vyhodnotenie} onVratSa={onVratSa} />

      <div className="suhrn__akcie bez-tlace">
        <button type="button" className="tlacidlo tlacidlo--druhotne" onClick={onZnova}>
          <ArrowCounterClockwise size={18} weight="bold" aria-hidden="true" />
          Skúsiť scenár znova
        </button>
        {dalsi ? (
          <a className="tlacidlo tlacidlo--hlavne" href={CESTY.scenar(dalsi.id)}>
            Ďalšia situácia: {dalsi.nazov}
            <span className="tlacidlo__ikona" aria-hidden="true">
              <ArrowRight size={16} weight="bold" />
            </span>
          </a>
        ) : (
          <a className="tlacidlo tlacidlo--hlavne" href={CESTY.prehlad}>
            Prehľad celého tréningu
            <span className="tlacidlo__ikona" aria-hidden="true">
              <ListChecks size={16} weight="bold" />
            </span>
          </a>
        )}
        <button type="button" className="tlacidlo tlacidlo--jemne" onClick={() => window.print()}>
          <Printer size={18} weight="bold" aria-hidden="true" />
          Vytlačiť alebo uložiť ako PDF
        </button>
        <a className="tlacidlo tlacidlo--jemne" href={CESTY.demo}>
          Všetky situácie
        </a>
      </div>
      <p className="tlmeny male">Výsledok ostáva len v tejto karte prehliadača. Nikam sa neposiela.</p>
    </section>
  );
}
