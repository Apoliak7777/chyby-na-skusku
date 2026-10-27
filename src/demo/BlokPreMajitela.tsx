import { ArrowRight, EnvelopeSimple } from '@phosphor-icons/react';
import { balicky, formatEur } from '../config/znacka';
import { mailtoJednaVeta, mailtoVeducemu } from '../web/kontakt';
import { useDemo } from './stav';

/**
 * Výzva pre majiteľa, ktorý si práve prešiel situáciu vymyslenej firmy: z jeho chyby
 * pripravím rovnakú situáciu. Len vo verejnej ukážke. Volajúci ho vykresľujú len pri
 * !JE_KLIENT, takže v klientskom builde (__KLIENT__ = true) sa tento modul ani kontakt
 * poskytovateľa do JS nedostanú; podmienka nižšie je poistka. Odkazy iba otvoria e-mail návštevníka.
 */
export function BlokPreMajitela({
  hlavny = false,
  uroven = 'h3',
  idPrefix,
}: {
  /** Hlavná akcia stránky (koniec poslednej situácie): väčšie tlačidlo, výraznejší rám. */
  hlavny?: boolean;
  uroven?: 'h2' | 'h3';
  idPrefix: string;
}) {
  const { trening } = useDemo();
  const JE_KLIENT = __KLIENT__ || trening.rezim === 'klient';
  if (JE_KLIENT) return null;
  const pilot = balicky.find((b) => b.id === 'pilot');
  const Nadpis = uroven;
  const idNadpisu = `${idPrefix}-majitel`;
  return (
    <section className={`majitel bez-tlace${hlavny ? ' majitel--hlavny' : ''}`} aria-labelledby={idNadpisu}>
      <Nadpis id={idNadpisu} className="majitel__nadpis">
        Toto bola vymyslená firma. Ktorá chyba sa opakuje u{' '}vás?
      </Nadpis>
      <p className="majitel__text">
        Takúto situáciu pripravím z vašej chyby, s vašimi produktmi a pravidlami. Čo je správne, schválite vy.
        {pilot && (
          <>
            {' '}
            Tri situácie za <span className="majitel__cena">{formatEur(pilot.cena)}</span>. Hotový tréning do 10 pracovných dní od úplných
            podkladov. Čas, keď čakám na vaše schválenie, sa do lehoty nepočíta.
          </>
        )}
      </p>
      <div className="majitel__akcie">
        <a className={`tlacidlo tlacidlo--hlavne${hlavny ? ' tlacidlo--velke' : ''}`} href={mailtoJednaVeta()}>
          <EnvelopeSimple size={18} weight="bold" aria-hidden="true" />
          Napísať jednou vetou
        </a>
        <a className={`tlacidlo tlacidlo--druhotne${hlavny ? ' tlacidlo--velke' : ''}`} href="#cennik">
          Čo je v cene
          <span className="tlacidlo__ikona" aria-hidden="true">
            <ArrowRight size={16} weight="bold" />
          </span>
        </a>
      </div>
      <p className="majitel__veduci">
        Nerozhodujete o tom vy? <a href={mailtoVeducemu()}>Poslať odkaz vedúcemu</a>
      </p>
      <p className="majitel__poznamka">Otvorí sa váš e-mail. Zo stránky sa nič neodosiela.</p>
    </section>
  );
}
