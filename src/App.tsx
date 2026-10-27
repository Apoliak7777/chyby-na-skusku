import { useEffect, useRef, type MouseEvent, type ReactNode } from 'react';
import { ArrowRight, CheckSquare } from '@phosphor-icons/react';
import { trening } from '@trening';
import { znacka } from './config/znacka';
import { DemoDomov } from './demo/DemoDomov';
import { PrehladTreningu } from './demo/PrehladTreningu';
import { Prehravac } from './demo/Prehravac';
import { DemoProvider } from './demo/stav';
import { CESTY, useTrasa } from './router';
import { Landing } from './web/Landing';
import { OchranaUdajov } from './web/OchranaUdajov';
import { Podmienky } from './web/Podmienky';

/**
 * Klientsky tréning: len prehrávač, bez predajného webu. __KLIENT__ je známe už pri preklade
 * (vite.config.ts), takže v klientskom builde je PREDAJ false a Rollup vypustí Landing,
 * podmienky, ochranu údajov aj kontakt poskytovateľa. rezim z dát tréningu je poistka
 * pre tréning zabalený bez TRENING_DIR.
 */
const JE_KLIENT = __KLIENT__ || trening.rezim === 'klient';
const PREDAJ = !JE_KLIENT;
const CESTA_OCHRANA = '/ochrana-udajov';
const CESTA_PODMIENKY = '/podmienky';

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
  if (PREDAJ) {
    if (cesta === '/') return `Zaškolenie nového človeka na príjme objednávok | ${znacka.nazov}`;
    if (cesta === CESTA_OCHRANA) return `Ochrana osobných údajov: ${znacka.nazov}`;
    if (cesta === CESTA_PODMIENKY) return `Podmienky pilotu: ${znacka.nazov}`;
  }
  const zaklad = PREDAJ ? znacka.nazov : trening.nazov;
  if (cesta === '/demo') return `Situácie: ${zaklad}`;
  if (cesta === '/demo/prehlad') return `Čo uvidí vedúci: ${zaklad}`;
  const scenar = trening.scenare.find((s) => cesta === `/demo/${s.id}`);
  return scenar ? `${scenar.nazov}: ${zaklad}` : zaklad;
}

function vyberObsah(cesta: string, params: URLSearchParams): ReactNode {
  if (PREDAJ) {
    if (cesta === '/') return <Landing />;
    if (cesta === CESTA_OCHRANA) return <OchranaUdajov />;
    if (cesta === CESTA_PODMIENKY) return <Podmienky />;
  }
  if (cesta === '/' || cesta === '/demo') return <DemoDomov />;
  if (cesta === '/demo/prehlad') return <PrehladTreningu />;
  const index = trening.scenare.findIndex((s) => cesta === `/demo/${s.id}`);
  const scenar = trening.scenare[index];
  if (scenar) {
    const prva = params.get('prva') ?? undefined;
    return <Prehravac key={scenar.id} scenar={scenar} poradie={index + 1} celkom={trening.scenare.length} prva={prva} />;
  }
  const prvaSituacia = trening.scenare[0];
  return (
    <div className="obal obal--uzky obsah--chyba">
      <h1>Táto stránka neexistuje</h1>
      <p>V adrese je možno preklep, alebo už neplatí.</p>
      <p>
        <a href={CESTY.web}>Späť na začiatok</a>
        {PREDAJ && prvaSituacia && (
          <>
            {' · '}
            <a href={CESTY.scenar(prvaSituacia.id)}>Vyskúšať ukážku</a>
          </>
        )}
      </p>
    </div>
  );
}

/** Značka služby: tmavý štvorec s fajkou a červenou bodkou (chyba zachytená včas). Rovnaký tvar ako public/favicon.svg. */
function Logo() {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      <rect width="32" height="32" rx="7" fill="#13202f" />
      <path d="M9 16.5l4.6 4.6L23.2 11.5" fill="none" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="25.5" cy="6.5" r="3.6" fill="#d92d20" stroke="#13202f" strokeWidth="1.4" />
    </svg>
  );
}

/** Odkaz „Preskočiť na obsah“ nesmie meniť hash, inak by router odišiel z ukážky na predajnú stránku. */
function preskocNaObsah(e: MouseEvent<HTMLAnchorElement>) {
  e.preventDefault();
  const obsah = document.getElementById('obsah');
  obsah?.focus();
  obsah?.scrollIntoView({ block: 'start' });
}

/** Položka navigácie tréningu; aktuálna stránka dostane aria-current a triedu na vizuálny stav. */
function OdkazNavigacie({ href, aktualna, children }: { href: string; aktualna: boolean; children: ReactNode }) {
  return (
    <a href={href} aria-current={aktualna ? 'page' : undefined} className={aktualna ? 'navigacia__aktualna' : undefined}>
      {children}
    </a>
  );
}

function Rozlozenie({ cesta, children }: { cesta: string; children: ReactNode }) {
  // Klientsky tréning má vždy hlavičku a rozloženie ukážky, aj na úvodnej adrese.
  const vDeme = JE_KLIENT || cesta.startsWith('/demo');
  // V klientskom tréningu je na „/“ zoznam situácií.
  const naSituaciach = cesta === '/demo' || (JE_KLIENT && cesta === '/');
  const vysledky = PREDAJ ? 'Výsledky ukážky' : 'Výsledky tréningu';
  const hlavicka = useRef<HTMLElement>(null);

  // Po posunutí stránky dostane hlavička jemný tieň (trieda priamo na prvku, bez prekreslenia Reactu).
  useEffect(() => {
    const prvok = hlavicka.current;
    if (!prvok) return undefined;
    let caka = false;
    const over = () => {
      caka = false;
      prvok.classList.toggle('hlavicka--posunuta', window.scrollY > 4);
    };
    const priPosune = () => {
      if (caka) return;
      caka = true;
      window.requestAnimationFrame(over);
    };
    over();
    window.addEventListener('scroll', priPosune, { passive: true });
    return () => window.removeEventListener('scroll', priPosune);
  }, []);

  return (
    <>
      <a className="preskocit" href="#obsah" onClick={preskocNaObsah}>
        Preskočiť na obsah
      </a>
      <header className="hlavicka bez-tlace" ref={hlavicka}>
        <div className="obal">
          <div className="hlavicka__ostrov">
            <a className="znacka" href={PREDAJ ? CESTY.web : CESTY.demo} translate="no">
              <span className="znacka__symbol" aria-hidden="true">
                {PREDAJ ? <Logo /> : <CheckSquare size={30} weight="fill" />}
              </span>
              <span className="znacka__text">
                {PREDAJ ? znacka.nazov : trening.znacka.nazovFirmy}
                {PREDAJ && vDeme && <span className="znacka__doplnok">ukážka</span>}
              </span>
            </a>
            <nav aria-label="Hlavná navigácia" className={PREDAJ ? 'navigacia' : 'navigacia navigacia--klient'}>
              {vDeme ? (
                <>
                  {PREDAJ && <a href={CESTY.web}>Späť na web</a>}
                  <OdkazNavigacie href={CESTY.demo} aktualna={naSituaciach}>
                    Situácie
                  </OdkazNavigacie>
                  <OdkazNavigacie href={CESTY.prehlad} aktualna={cesta === '/demo/prehlad'}>
                    Čo uvidí vedúci
                  </OdkazNavigacie>
                </>
              ) : (
                <>
                  <a href="#ukazka">Ukážka</a>
                  <a href="#co-dostanete">Čo dostanete</a>
                  <a href="#cennik">Cena</a>
                  <a href="#otazky">Otázky</a>
                </>
              )}
            </nav>
            {PREDAJ && (
              <a className="tlacidlo tlacidlo--hlavne tlacidlo--male navigacia__cta" href="#dopyt">
                <span className="navigacia__cta-dlhe">{vDeme ? 'Chcem to s našimi chybami' : 'Napísať jednou vetou'}</span>
                <span className="navigacia__cta-kratke">Napísať</span>
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
            {PREDAJ ? <KontaktPoskytovatela /> : (
              <p className="paticka__znacka" translate="no">
                <strong>{trening.znacka.nazovFirmy}</strong>
              </p>
            )}
          </div>
          <div className="paticka__poznamky">
            {trening.znacka.jeModelova && (
              <p className="tlmeny male">
                Ukážka používa vymyslenú firmu {trening.znacka.nazovFirmy}. Mená, produkty, objednávky aj sumy sú modelové.
              </p>
            )}
            <p className="tlmeny male">
              Stránka nepoužíva cookies, cudzie skripty ani sledovanie. {vysledky} sú len v otvorenej stránke a po jej
              obnovení zmiznú. Nič sa neukladá ani neposiela.
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}

/** Pätička verejného webu: značka, údaje poskytovateľa (len vyplnené), kontakt a právne stránky. */
function KontaktPoskytovatela() {
  return (
    <>
      <p className="paticka__znacka" translate="no">
        <strong>{znacka.nazov}</strong>
        {znacka.poskytovatel && <span className="tlmeny"> · {znacka.poskytovatel}</span>}
        {znacka.ico && <span className="tlmeny"> · IČO {znacka.ico}</span>}
        <span className="tlmeny"> · {znacka.rok}</span>
      </p>
      {znacka.sidlo && <p className="tlmeny male">{znacka.sidlo}</p>}
      <p className="tlmeny male">
        {znacka.kontaktEmail ? (
          <>
            Kontakt: <a href={`mailto:${znacka.kontaktEmail}`}>{znacka.kontaktEmail}</a>
          </>
        ) : (
          <>
            Kontakt: <a href="#dopyt">napíšte mi</a>
          </>
        )}
        {znacka.telefon && (
          <>
            {' · '}
            <a href={`tel:${znacka.telefon.replace(/\s+/g, '')}`}>{znacka.telefon}</a>
          </>
        )}
      </p>
      <p className="tlmeny male paticka__odkazy">
        <a href={CESTY.podmienky}>Podmienky pilotu</a>
        <a href={CESTY.ochrana}>Ochrana osobných údajov</a>
      </p>
    </>
  );
}
