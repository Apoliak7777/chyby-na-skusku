import type { Icon } from '@phosphor-icons/react';
import { ArrowsLeftRight, Barcode, ClipboardText, EnvelopeSimple, Info, Package, Scales } from '@phosphor-icons/react';
import type { Blok, DruhPodkladu, Podklad } from '../data/types';
import { rozdelPodlaKodov } from '../engine/sadzba';

const IKONY: Record<DruhPodkladu, Icon> = {
  email: EnvelopeSimple,
  sklad: Package,
  produkt: Barcode,
  objednavka: ClipboardText,
  pravidla: Scales,
  porovnanie: ArrowsLeftRight,
  ine: Info,
};

/** Krátky údaj s číslom (množstvo, suma, kód, čas) sa vysadí písmom pre čísla, dlhší text nie. */
function triedaUdaja(text: string): string | undefined {
  return /\d/.test(text) && text.length <= 16 ? 'udaj' : undefined;
}

/**
 * Text so slovenskou sadzbou: jednopísmenová predložka, „s. r. o.“, dátum ani číslo s jednotkou
 * neostanú rozdelené na konci riadka a kódy (D-1038, L-240B) sa nelámu na spojovníku.
 */
export function Sadzba({ text }: { text: string }) {
  const casti = rozdelPodlaKodov(text);
  if (casti.length === 1) return <>{casti[0]}</>;
  return (
    <>
      {casti.map((c, i) =>
        i % 2 === 1 ? (
          <span key={i} className="bez-zlomu">
            {c}
          </span>
        ) : (
          c
        ),
      )}
    </>
  );
}

/** Ikona druhu podkladu (dekoratívna, text je vždy vedľa nej). */
export function IkonaPodkladu({ druh, size = 18 }: { druh: DruhPodkladu; size?: number }) {
  const Ikona = IKONY[druh];
  return <Ikona size={size} weight="regular" aria-hidden="true" />;
}

/**
 * Vykreslí bloky obsahu (e-mail, tabuľka, záznam, poznámka…) v čitateľnej „pracovnej“ podobe.
 * Tabuľka nesie názov stĺpca pri každej bunke, aby sa v úzkom mieste mohla zložiť do kariet.
 */
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
            <p key={i}>
              <Sadzba text={p} />
            </p>
          ))}
        </>
      );
    case 'email':
      return (
        <article className="email">
          {/* Mriežka popis | hodnota: dlhá hodnota sa zalomí pod seba, nie pod popis. */}
          <div className="email__hlavicka">
            <div className="email__riadok">
              <span className="email__popis">Od:</span>
              <span>
                <Sadzba text={blok.od} />
              </span>
            </div>
            {blok.komu && (
              <div className="email__riadok email__komu">
                <span className="email__popis">Komu:</span>
                <span>
                  <Sadzba text={blok.komu} />
                </span>
              </div>
            )}
            <div className="email__riadok">
              <span className="email__popis">Predmet:</span>
              <strong>
                <Sadzba text={blok.predmet} />
              </strong>
            </div>
            {blok.datum && (
              <div className="email__riadok">
                <span className="email__popis">Prijaté:</span>
                <span>
                  <Sadzba text={blok.datum} />
                </span>
              </div>
            )}
          </div>
          <div className="email__telo">
            {blok.text.map((p, i) => (
              <p key={i}>
                <Sadzba text={p} />
              </p>
            ))}
          </div>
        </article>
      );
    case 'tabulka':
      return (
        <div className="tabulka-obal">
          <table className="tabulka">
            {blok.nadpis && (
              <caption>
                <Sadzba text={blok.nadpis} />
              </caption>
            )}
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
                  {r.map((b, j) =>
                    j === 0 ? (
                      <th key={j} scope="row">
                        <Sadzba text={b} />
                      </th>
                    ) : (
                      <td key={j} data-stlpec={blok.stlpce[j] ?? ''} className={triedaUdaja(b)}>
                        {/* Jeden obal: v úzkom mieste je bunka mriežka (popis stĺpca | hodnota). */}
                        <span>
                          <Sadzba text={b} />
                        </span>
                      </td>
                    ),
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          {blok.poznamka && (
            <p className="tabulka__poznamka">
              <Sadzba text={blok.poznamka} />
            </p>
          )}
        </div>
      );
    case 'poznamka':
      return (
        <aside className="poznamka">
          {blok.nadpis && <strong className="poznamka__nadpis">{blok.nadpis}</strong>}
          {blok.text.map((p, i) => (
            <p key={i}>
              <Sadzba text={p} />
            </p>
          ))}
        </aside>
      );
    case 'zaznam':
      return (
        <div className="zaznam">
          <div className="zaznam__nadpis">
            <Sadzba text={blok.nadpis} />
          </div>
          <dl>
            {blok.polia.map((p, i) => (
              <div key={i} className={p.zvyraznit ? 'zaznam__riadok zaznam__riadok--zvyraznene' : 'zaznam__riadok'}>
                <dt>{p.nazov}</dt>
                <dd className={triedaUdaja(p.hodnota)}>
                  <Sadzba text={p.hodnota} />
                </dd>
              </div>
            ))}
          </dl>
        </div>
      );
    case 'zoznam':
      return (
        <div className="zoznam">
          {blok.nadpis && (
            <strong className="zoznam__nadpis">
              <Sadzba text={blok.nadpis} />
            </strong>
          )}
          <ol>
            {blok.polozky.map((p, i) => (
              <li key={i}>
                <Sadzba text={p} />
              </li>
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
