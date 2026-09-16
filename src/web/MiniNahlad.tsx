import { useState } from 'react';
import { ArrowRight, ArrowCounterClockwise, EnvelopeSimple, Package } from '@phosphor-icons/react';
import { slubenyTermin } from '../data/demo/scenar1_slubeny_termin';
import { CESTY } from '../router';

/**
 * Živá ukážka prvej situácie priamo v hero: skutočný kus produktu, nie obrázok.
 * Po voľbe ukáže následok a pustí návštevníka do dema s už zvoleným prvým krokom.
 */
export function MiniNahlad() {
  const [volba, setVolba] = useState<'potvrdit' | 'overit' | null>(null);
  const sklad = slubenyTermin.podklady.find((p) => p.id === 's1-sklad');
  const tabulka = sklad?.bloky.find((b) => b.typ === 'tabulka');
  if (!tabulka || tabulka.typ !== 'tabulka') return null;

  return (
    <div className="bezel hero__ukazka" aria-label="Živá ukážka situácie Sľúbený termín">
      <div className="bezel__jadro nahlad">
        <div className="nahlad__hlavicka">
          <span className="nahlad__stitok">Živá ukážka</span>
          <span className="tlmeny male">Situácia 1 z 3: Sľúbený termín</span>
        </div>

        <div className="nahlad__citat">
          <EnvelopeSimple size={20} weight="regular" aria-hidden="true" className="nahlad__ikona" />
          <div>
            <p className="nahlad__citat-od">Zákazník píše v stredu ráno:</p>
            <p className="nahlad__citat-text">
              „Potrebujeme <strong>8 kusov L-240</strong> v jednej dodávke <strong>najneskôr v piatok</strong>. Viete termín potvrdiť?“
            </p>
          </div>
        </div>

        <div className="nahlad__sklad">
          <p className="nahlad__sklad-nadpis">
            <Package size={18} weight="regular" aria-hidden="true" /> Sklad, streda 9:35
          </p>
          <div className="tabulka-obal">
            <table className="tabulka tabulka--kompakt">
              <caption className="visually-hidden">{tabulka.nadpis}</caption>
              <thead>
                <tr>
                  {tabulka.stlpce.slice(0, 4).map((s, i) => (
                    <th key={i} scope="col">
                      {s}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tabulka.riadky.map((r, i) => (
                  <tr key={i}>
                    {r.slice(0, 4).map((b, j) =>
                      j === 0 ? (
                        <th key={j} scope="row">
                          {b.replace(' konzola 240 mm', '')}
                        </th>
                      ) : (
                        <td key={j} className={j === 3 ? 'nahlad__volne' : undefined}>
                          {b.replace(' (obj. D-1038, expedícia štvrtok)', '')}
                        </td>
                      ),
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {volba === null ? (
          <div className="rozhodnutie" role="group" aria-labelledby="nahlad-uloha">
            <p id="nahlad-uloha" className="nahlad__otazka">
              Zákazník čaká. Čo urobíte?
            </p>
            <div className="moznosti">
              <button type="button" className="moznost" onClick={() => setVolba('potvrdit')}>
                <span className="moznost__pismeno" aria-hidden="true">
                  A
                </span>
                <span className="moznost__text">Potvrdiť piatok hneď. L-240 predsa máme na sklade.</span>
              </button>
              <button type="button" className="moznost" onClick={() => setVolba('overit')}>
                <span className="moznost__pismeno" aria-hidden="true">
                  B
                </span>
                <span className="moznost__text">Najprv pozrieť, koľko kusov je naozaj voľných.</span>
              </button>
            </div>
          </div>
        ) : (
          <div className={`nahlad__reakcia${volba === 'potvrdit' ? ' nahlad__reakcia--chyba' : ''}`} role="status">
            {volba === 'potvrdit' ? (
              <>
                <p className="nahlad__reakcia-nadpis">Presne toto sa stane nováčikovi.</p>
                <p>
                  <strong>O 10:30 volá sklad:</strong> z 12 kusov je 9 rezervovaných pre inú objednávku. Voľné sú 3. Zákazník už má vaše
                  potvrdenie na 8.
                </p>
                <a className="tlacidlo tlacidlo--hlavne" href={CESTY.scenar(slubenyTermin.id, 's1-start-potvrdit')}>
                  Pokračovať v ukážke a napraviť to
                  <span className="tlacidlo__ikona" aria-hidden="true">
                    <ArrowRight size={16} weight="bold" />
                  </span>
                </a>
              </>
            ) : (
              <>
                <p className="nahlad__reakcia-nadpis">Správne. Voľné sú len 3 kusy.</p>
                <p>Fyzicky 12, rezervovaných 9. Zákazník chce 8 do piatka. Čo mu teraz sľúbite?</p>
                <a className="tlacidlo tlacidlo--hlavne" href={CESTY.scenar(slubenyTermin.id, 's1-start-overit')}>
                  Pokračovať v ukážke
                  <span className="tlacidlo__ikona" aria-hidden="true">
                    <ArrowRight size={16} weight="bold" />
                  </span>
                </a>
              </>
            )}
            <button type="button" className="tlacidlo tlacidlo--jemne tlacidlo--male" onClick={() => setVolba(null)}>
              <ArrowCounterClockwise size={16} weight="bold" aria-hidden="true" /> Vybrať inak
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
