import { useEffect, useRef, useState } from 'react';
import { ArrowCounterClockwise, ArrowRight, EnvelopeSimple } from '@phosphor-icons/react';
import { poradie } from '../pohyb';
import { CESTY } from '../router';
import { Sadzba } from './sadzba';

/**
 * Živá ukážka prvej situácie priamo v hero: skutočný kus produktu, nie obrázok.
 * Pred voľbou vidí návštevník len to, čo nový človek v systéme (stav skladu). Rezervácie
 * a voľné kusy sa ukážu až po voľbe. Potom pustí návštevníka do ukážky s už zvoleným
 * prvým krokom (id možností zo scenára Sľúbený termín).
 *
 * Pohyb po voľbe (styles.css): nové stĺpce sa odkryjú bunka po bunke, pri chybnej voľbe sa
 * „12 ks“ preškrtne červenou čiarou ako perom a voľné kusy, ktoré nestačia, sa podčiarknu
 * zvýrazňovačom. Text v bunkách ostáva rovnaký, čiara aj zvýraznenie sú len ozdoba.
 */

const SCENAR = 'slubeny-termin';

/** Koľko kusov chce zákazník; riadok, kde voľných je menej, nesie pointu situácie. */
const OBJEDNANE_KS = 8;

/** Čísla zo skladového prehľadu situácie 1 (src/data/demo, kontroluje mini_nahlad.test.ts). */
export const SKLAD_NAHLAD = [
  { produkt: 'L-240', naSklade: 12, rezervovane: 9, volne: 3 },
  { produkt: 'L-240B', naSklade: 14, rezervovane: 4, volne: 10 },
] as const;

type Volba = 'potvrdit' | 'overit' | null;

export function MiniNahlad() {
  const [volba, setVolba] = useState<Volba>(null);
  // Po „Vybrať inak“ sa možnosti vrátia plynulo; pri prvom vykreslení stoja.
  const [znova, setZnova] = useState(false);
  const odhalene = volba !== null;
  const nadpisReakcie = useRef<HTMLParagraphElement>(null);
  const prvaMoznost = useRef<HTMLButtonElement>(null);
  // Fokus sa presúva len po kliknutí návštevníka, nie pri prvom vykreslení stránky.
  const presunutFokus = useRef(false);

  // Stlačené tlačidlo zmizne z DOM: fokus ide na nadpis reakcie, po „Vybrať inak“ na prvú možnosť.
  useEffect(() => {
    if (!presunutFokus.current) return;
    presunutFokus.current = false;
    (volba === null ? prvaMoznost.current : nadpisReakcie.current)?.focus();
  }, [volba]);

  const zvol = (nova: Volba) => {
    presunutFokus.current = true;
    if (nova === null) setZnova(true);
    setVolba(nova);
  };

  return (
    <Sadzba>
      <div className="nahlad" role="region" aria-label="Živá ukážka situácie Sľúbený termín">
        <div className="nahlad__hlavicka">
          <span className="nahlad__stitok mono">Ukážka</span>
          <span className="nahlad__kde">Situácia 1 z 3: Sľúbený termín</span>
        </div>

        <div className="nahlad__mail">
          <EnvelopeSimple size={20} weight="regular" aria-hidden="true" className="nahlad__ikona" />
          <div>
            <p className="nahlad__mail-od">Zákazník píše v stredu ráno:</p>
            <p className="nahlad__mail-text">
              „Potrebujeme <strong>8 kusov L-240</strong> v jednej dodávke <strong>najneskôr v piatok</strong>. Viete termín potvrdiť?“
            </p>
          </div>
        </div>

        <table className="nahlad__sklad">
          <caption>Sklad, streda 9:35</caption>
          <thead>
            <tr>
              <th scope="col">Produkt</th>
              <th scope="col">Na sklade</th>
              {odhalene && (
                <>
                  <th scope="col">
                    <span className="nahlad__odkryte" style={poradie(0)}>
                      Rezervované
                    </span>
                  </th>
                  <th scope="col">
                    <span className="nahlad__odkryte" style={poradie(1)}>
                      Voľné
                    </span>
                  </th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {SKLAD_NAHLAD.map((r, i) => {
              const nestaci = r.volne < OBJEDNANE_KS;
              return (
                <tr key={r.produkt}>
                  <th scope="row" className="mono">
                    {r.produkt}
                  </th>
                  <td className="mono">
                    <span className={`nahlad__hodnota${volba === 'potvrdit' && nestaci ? ' nahlad__hodnota--preskrtnuta' : ''}`}>
                      {`${r.naSklade} ks`}
                    </span>
                  </td>
                  {odhalene && (
                    <>
                      <td className="mono">
                        <span className="nahlad__odkryte" style={poradie(i + 1)}>{`${r.rezervovane} ks`}</span>
                      </td>
                      <td className={`mono${nestaci ? ' nahlad__malo' : ''}`}>
                        <span className={`nahlad__odkryte${nestaci ? ' nahlad__hodnota--zvyraznena' : ''}`} style={poradie(i + 2)}>
                          {`${r.volne} ks`}
                        </span>
                      </td>
                    </>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Živý región je v DOM stále, mení sa len jeho text. */}
        <p className="visually-hidden" role="status">
          {odhalene ? 'V tabuľke pribudli stĺpce Rezervované a Voľné.' : ''}
        </p>

        {volba === null ? (
          <div className={`nahlad__rozhodnutie${znova ? ' nahlad__rozhodnutie--znova' : ''}`} role="group" aria-labelledby="nahlad-uloha">
            <p id="nahlad-uloha" className="nahlad__otazka">
              Zákazník čaká na odpoveď. Čo urobíte?
            </p>
            <div className="nahlad__moznosti">
              <button type="button" className="nahlad__moznost" ref={prvaMoznost} onClick={() => zvol('potvrdit')}>
                <span className="nahlad__pismeno mono" aria-hidden="true">
                  A
                </span>
                <span>Potvrdiť piatok. Na sklade je 12 kusov.</span>
              </button>
              <button type="button" className="nahlad__moznost" onClick={() => zvol('overit')}>
                <span className="nahlad__pismeno mono" aria-hidden="true">
                  B
                </span>
                <span>Odpovedať až po kontrole rezervácií.</span>
              </button>
            </div>
          </div>
        ) : (
          <div className={`nahlad__reakcia${volba === 'potvrdit' ? ' nahlad__reakcia--chyba' : ' nahlad__reakcia--ok'}`}>
            {volba === 'potvrdit' ? (
              <>
                <p className="nahlad__reakcia-nadpis" ref={nadpisReakcie} tabIndex={-1}>
                  Presne toto sa stane novému človeku.
                </p>
                <p>
                  <strong>O 10:30 volá sklad:</strong> z 12 kusov je 9 rezervovaných pre inú objednávku. Voľné sú 3. Zákazník už má vaše
                  potvrdenie na 8 kusov v piatok.
                </p>
                <a className="tlacidlo tlacidlo--hlavne tlacidlo--cely" href={CESTY.scenar(SCENAR, 's1-start-potvrdit')}>
                  Pokračovať a napraviť to
                  <span className="tlacidlo__ikona" aria-hidden="true">
                    <ArrowRight size={16} weight="bold" />
                  </span>
                </a>
              </>
            ) : (
              <>
                <p className="nahlad__reakcia-nadpis" ref={nadpisReakcie} tabIndex={-1}>
                  Správne. Voľné sú len 3 kusy.
                </p>
                <p>
                  Keby nový človek potvrdil hneď, o 10:30 by volal sklad: 9 z 12 kusov patrí inej objednávke. Zákazník by už mal potvrdenie
                  na 8 kusov v piatok. Čo mu teraz sľúbite?
                </p>
                <a className="tlacidlo tlacidlo--hlavne tlacidlo--cely" href={CESTY.scenar(SCENAR, 's1-start-overit')}>
                  Pokračovať v situácii
                  <span className="tlacidlo__ikona" aria-hidden="true">
                    <ArrowRight size={16} weight="bold" />
                  </span>
                </a>
              </>
            )}
            <button type="button" className="nahlad__znova" onClick={() => zvol(null)}>
              <ArrowCounterClockwise size={16} weight="bold" aria-hidden="true" /> Vybrať inak
            </button>
          </div>
        )}
      </div>
    </Sadzba>
  );
}
