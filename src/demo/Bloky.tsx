import type { Icon } from '@phosphor-icons/react';
import { ArrowsLeftRight, Barcode, ClipboardText, EnvelopeSimple, Info, Package, Scales } from '@phosphor-icons/react';
import type { Blok, DruhPodkladu, Podklad } from '../data/types';

const IKONY: Record<DruhPodkladu, Icon> = {
  email: EnvelopeSimple,
  sklad: Package,
  produkt: Barcode,
  objednavka: ClipboardText,
  pravidla: Scales,
  porovnanie: ArrowsLeftRight,
  ine: Info,
};

/** Ikona druhu podkladu (dekoratívna, text je vždy vedľa nej). */
export function IkonaPodkladu({ druh, size = 18 }: { druh: DruhPodkladu; size?: number }) {
  const Ikona = IKONY[druh];
  return <Ikona size={size} weight="regular" aria-hidden="true" />;
}

/** Vykreslí bloky obsahu (e-mail, tabuľka, záznam, poznámka…) v čitateľnej „pracovnej“ podobe. */
export function Bloky({ bloky, podklady }: { bloky: Blok[]; podklady: Podklad[] }) {
  return (
    <>
      {bloky.map((blok, i) => (
        <JedenBlok key={i} blok={blok} podklady={podklady} />
      ))}
    </>
  );
}

function JedenBlok({ blok, podklady }: { blok: Blok; podklady: Podklad[] }) {
  switch (blok.typ) {
    case 'text':
      return (
        <>
          {blok.text.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </>
      );
    case 'email':
      return (
        <article className="email">
          <div className="email__hlavicka">
            <div>
              <span className="email__popis">Od:</span> {blok.od}
            </div>
            {blok.komu && (
              <div>
                <span className="email__popis">Komu:</span> {blok.komu}
              </div>
            )}
            <div>
              <span className="email__popis">Predmet:</span> <strong>{blok.predmet}</strong>
            </div>
            {blok.datum && (
              <div>
                <span className="email__popis">Prijaté:</span> {blok.datum}
              </div>
            )}
          </div>
          <div className="email__telo">
            {blok.text.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </article>
      );
    case 'tabulka':
      return (
        <div className="tabulka-obal">
          <table className="tabulka">
            {blok.nadpis && <caption>{blok.nadpis}</caption>}
            <thead>
              <tr>
                {blok.stlpce.map((s, i) => (
                  <th key={i} scope="col">
                    {s}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {blok.riadky.map((r, i) => (
                <tr key={i}>
                  {r.map((b, j) => (j === 0 ? <th key={j} scope="row">{b}</th> : <td key={j}>{b}</td>))}
                </tr>
              ))}
            </tbody>
          </table>
          {blok.poznamka && <p className="tabulka__poznamka">{blok.poznamka}</p>}
        </div>
      );
    case 'poznamka':
      return (
        <aside className="poznamka">
          {blok.nadpis && <strong className="poznamka__nadpis">{blok.nadpis}</strong>}
          {blok.text.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </aside>
      );
    case 'zaznam':
      return (
        <div className="zaznam">
          <div className="zaznam__nadpis">{blok.nadpis}</div>
          <dl>
            {blok.polia.map((p, i) => (
              <div key={i} className={p.zvyraznit ? 'zaznam__riadok zaznam__riadok--zvyraznene' : 'zaznam__riadok'}>
                <dt>{p.nazov}</dt>
                <dd>{p.hodnota}</dd>
              </div>
            ))}
          </dl>
        </div>
      );
    case 'zoznam':
      return (
        <div className="zoznam">
          {blok.nadpis && <strong className="zoznam__nadpis">{blok.nadpis}</strong>}
          <ol>
            {blok.polozky.map((p, i) => (
              <li key={i}>{p}</li>
            ))}
          </ol>
        </div>
      );
    case 'podklad': {
      const podklad = podklady.find((p) => p.id === blok.podklad);
      if (!podklad) return null;
      return (
        <section className="podklad-vlozeny" aria-label={podklad.nazov}>
          <div className="podklad-vlozeny__nadpis">
            <IkonaPodkladu druh={podklad.druh} size={16} /> {podklad.nazov}
          </div>
          <Bloky bloky={podklad.bloky} podklady={[]} />
        </section>
      );
    }
    default:
      return null;
  }
}
