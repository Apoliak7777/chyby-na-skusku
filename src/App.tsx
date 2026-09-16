import { useEffect, type ReactNode } from 'react';
import { ArrowRight, CheckSquare } from '@phosphor-icons/react';
import { trening } from '@trening';
import { znacka } from './config/znacka';
import { DemoDomov } from './demo/DemoDomov';
import { PrehladTreningu } from './demo/PrehladTreningu';
import { Prehravac } from './demo/Prehravac';
import { DemoProvider } from './demo/stav';
import { CESTY, useTrasa } from './router';
import { Landing } from './web/Landing';

const JE_KLIENT = trening.rezim === 'klient';

export function App() {
  const trasa = useTrasa();

  // Po zmene trasy hore; pri kotve na predajnom webe posun na sekciu (až po vykreslení).
  useEffect(() => {
    if (trasa.kotva) {
      const kotva = trasa.kotva;
      const id = window.requestAnimationFrame(() => document.getElementById(kotva)?.scrollIntoView({ block: 'start' }));
      return () => window.cancelAnimationFrame(id);
    }
    window.scrollTo(0, 0);
    return undefined;
  }, [trasa.cesta, trasa.kotva]);

  useEffect(() => {
    document.title = nazovStranky(trasa.cesta);
  }, [trasa.cesta]);

  const obsah = vyberObsah(trasa.cesta, trasa.params);

  return (
    <DemoProvider trening={trening}>
      <Rozlozenie cesta={trasa.cesta}>{obsah}</Rozlozenie>
    </DemoProvider>
  );
}

function nazovStranky(cesta: string): string {
  const zaklad = JE_KLIENT ? trening.nazov : znacka.nazov;
  if (cesta === '/') return JE_KLIENT ? zaklad : `${zaklad}: tréning z vlastných chýb firmy`;
  if (cesta === '/demo') return `Situácie: ${zaklad}`;
  if (cesta === '/demo/prehlad') return `Prehľad tréningu: ${zaklad}`;
  const scenar = trening.scenare.find((s) => cesta === `/demo/${s.id}`);
  return scenar ? `${scenar.nazov}: ${zaklad}` : zaklad;
}

function vyberObsah(cesta: string, params: URLSearchParams): ReactNode {
  if (cesta === '/') return JE_KLIENT ? <DemoDomov /> : <Landing />;
  if (cesta === '/demo') return <DemoDomov />;
  if (cesta === '/demo/prehlad') return <PrehladTreningu />;
  const index = trening.scenare.findIndex((s) => cesta === `/demo/${s.id}`);
  const scenar = trening.scenare[index];
  if (scenar) {
    const prva = params.get('prva') ?? undefined;
    return <Prehravac key={scenar.id} scenar={scenar} poradie={index + 1} celkom={trening.scenare.length} prva={prva} />;
  }
  return (
    <div className="obal obal--uzky obsah--chyba">
      <h1>Táto stránka neexistuje</h1>
      <p>
        Adresa {cesta} nikam nevedie. <a href={CESTY.web}>Späť na začiatok</a>.
      </p>
    </div>
  );
}

function Rozlozenie({ cesta, children }: { cesta: string; children: ReactNode }) {
  const vDeme = cesta.startsWith('/demo');
  return (
    <>
      <a className="preskocit" href="#obsah">
        Preskočiť na obsah
      </a>
      <header className="hlavicka bez-tlace">
        <div className="obal">
          <div className="hlavicka__ostrov">
            <a className="znacka" href={JE_KLIENT ? CESTY.demo : CESTY.web} translate="no">
              <span className="znacka__symbol" aria-hidden="true">
                <CheckSquare size={22} weight="fill" />
              </span>
              <span className="znacka__text">
                {JE_KLIENT ? trening.znacka.nazovFirmy : znacka.nazov}
                {vDeme && !JE_KLIENT && <span className="znacka__doplnok">ukážka</span>}
              </span>
            </a>
            <nav aria-label="Hlavná navigácia" className="navigacia">
              {vDeme ? (
                <>
                  {!JE_KLIENT && <a href={CESTY.web}>Späť na web</a>}
                  <a href={CESTY.demo}>Situácie</a>
                  <a href={CESTY.prehlad}>Prehľad</a>
                </>
              ) : (
                <>
                  <a href="#ako">Ako to funguje</a>
                  <a href="#ukazka">Ukážka</a>
                  <a href="#cennik">Cena</a>
                  <a href="#otazky">Otázky</a>
                </>
              )}
            </nav>
            {vDeme ? (
              !JE_KLIENT && (
                <a className="tlacidlo tlacidlo--hlavne tlacidlo--male navigacia__cta" href="#dopyt">
                  Chcem pilot za 690 €
                </a>
              )
            ) : (
              <a className="tlacidlo tlacidlo--hlavne tlacidlo--male navigacia__cta" href={CESTY.demo} aria-label="Vyskúšať ukážku">
                <span className="navigacia__cta-dlhe">Vyskúšať ukážku</span>
                <span className="navigacia__cta-kratke">Ukážka</span>
                <span className="tlacidlo__ikona" aria-hidden="true">
                  <ArrowRight size={14} weight="bold" />
                </span>
              </a>
            )}
          </div>
        </div>
      </header>
      <main id="obsah" className={vDeme ? 'obsah obsah--demo' : 'obsah'} tabIndex={-1}>
        {children}
      </main>
      <footer className="paticka bez-tlace">
        <div className="obal paticka__obal">
          <div className="paticka__hlavne">
            <p className="paticka__znacka" translate="no">
              <strong>{JE_KLIENT ? trening.znacka.nazovFirmy : znacka.nazov}</strong>
              {!JE_KLIENT && znacka.poskytovatel && <span className="tlmeny"> · {znacka.poskytovatel}</span>}
              <span className="tlmeny"> · {znacka.rok}</span>
            </p>
            {!JE_KLIENT &&
              (znacka.kontaktEmail ? (
                <p className="tlmeny male">
                  Kontakt: <a href={`mailto:${znacka.kontaktEmail}`}>{znacka.kontaktEmail}</a>
                </p>
              ) : (
                <p className="tlmeny male">
                  Kontakt: <a href="#dopyt">dopyt vyššie</a>
                </p>
              ))}
          </div>
          <div className="paticka__poznamky">
            {trening.znacka.jeModelova && (
              <p className="tlmeny male">
                Ukážka používa vymyslenú firmu {trening.znacka.nazovFirmy}. Mená, produkty, objednávky aj sumy sú modelové. Sumy následkov sú
                ilustračné, nie nameraná úspora.
              </p>
            )}
            <p className="tlmeny male">Stránka nepoužíva cookies, cudzie skripty ani sledovanie. Výsledky ukážky ostávajú v prehliadači.</p>
          </div>
        </div>
      </footer>
    </>
  );
}
