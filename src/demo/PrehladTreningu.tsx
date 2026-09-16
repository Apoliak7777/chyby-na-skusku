import { Printer } from '@phosphor-icons/react';
import { formatEur } from '../config/znacka';
import { POPIS_VERDIKTU, vyhodnot } from '../engine/pokus';
import { CESTY } from '../router';
import { TabulkaBodov, ZoznamRozhodnuti } from './Suhrn';
import { useDemo } from './stav';

/** Prehľad celého tréningu na tlač alebo uloženie do PDF: posledný dokončený pokus každej situácie. */
export function PrehladTreningu() {
  const demo = useDemo();
  const { trening } = demo;
  const teraz = new Date();
  const datum = new Intl.DateTimeFormat('sk-SK', { dateStyle: 'medium', timeStyle: 'short' }).format(teraz);

  return (
    <div className="obal obal--uzky prehlad">
      <p className="postup">
        {trening.znacka.nazovFirmy}
        {trening.znacka.jeModelova && <span className="odznak odznak--model">vymyslená firma</span>}
      </p>
      <h1>Prehľad tréningu</h1>
      <p className="tlmeny">
        {trening.nazov}, {trening.pozicia}. Vytlačené {datum}.
      </p>
      <p className="tlmeny male">
        Prehľad ukazuje posledný dokončený pokus každej situácie. Neobsahuje meno pracovníka a nikam sa neposiela. Vytlačte ho alebo
        uložte ako PDF cez tlač prehliadača.
      </p>
      <div className="bez-tlace suhrn__akcie">
        <button type="button" className="tlacidlo tlacidlo--hlavne" onClick={() => window.print()}>
          <Printer size={18} weight="bold" aria-hidden="true" />
          Vytlačiť alebo uložiť ako PDF
        </button>
        <a className="tlacidlo tlacidlo--jemne" href={CESTY.demo}>
          Späť na situácie
        </a>
      </div>

      {trening.scenare.map((s, i) => {
        const aktualny = demo.pokus(s);
        const aktualneV = vyhodnot(s, aktualny);
        const posledny = demo.posledneDokoncene(s.id);
        const zobrazene = aktualneV.dokonceny ? aktualneV : posledny?.vyhodnotenie;
        return (
          <section key={s.id} className="prehlad__scenar" aria-labelledby={`prehlad-${s.id}`}>
            <p className="postup">Situácia {i + 1} z {trening.scenare.length}</p>
            <h2 id={`prehlad-${s.id}`}>{s.nazov}</h2>
            <p className="tlmeny">Precvičuje: {s.cvici}</p>
            {!zobrazene ? (
              <p>
                Zatiaľ nedokončené.{' '}
                <a className="bez-tlace" href={CESTY.scenar(s.id)}>
                  Otvoriť situáciu
                </a>
              </p>
            ) : (
              <>
                <p>
                  <strong>Výsledok: {POPIS_VERDIKTU[zobrazene.verdikt].nadpis}</strong>
                  {zobrazene.zaver ? `, ${zobrazene.zaver.nadpis}` : ''}
                  {zobrazene.naklad > 0 ? `, modelový následok ${formatEur(zobrazene.naklad)}` : ''}
                  {!aktualneV.dokonceny && posledny ? ' (predchádzajúci dokončený pokus; nový pokus je rozpracovaný)' : ''}
                </p>
                <TabulkaBodov vyhodnotenie={zobrazene} sVysvetlenim={false} />
                <h3>Rozhodnutia</h3>
                <ZoznamRozhodnuti vyhodnotenie={zobrazene} />
              </>
            )}
          </section>
        );
      })}

      <p className="tlmeny male">
        {trening.znacka.jeModelova
          ? 'Všetky situácie, mená, produkty a sumy sú modelové. Sumy sú ilustračné následky konkrétnych vetiev, nie nameraná úspora.'
          : 'Sumy v tréningu sú ilustračné následky konkrétnych vetiev podľa schválených pravidiel firmy.'}
      </p>
    </div>
  );
}
