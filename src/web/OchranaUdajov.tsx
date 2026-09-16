import { znacka } from '../config/znacka';
import { CESTY } from '../router';

/**
 * Ochrana osobných údajov. Web nemá cookies, sledovanie ani vlastný backend;
 * osobné údaje vznikajú až vtedy, keď návštevník pošle dopyt zo svojho e-mailu.
 */
export function OchranaUdajov() {
  const email = znacka.kontaktEmail;
  return (
    <div className="obal obal--uzky pravne">
      <h1>Ochrana osobných údajov</h1>
      <p className="tlmeny">Platí pre web {znacka.webAdresa.replace('https://', '')} a ukážku tréningu na ňom. Stav k 16. 9. 2026.</p>

      <h2>Čo tento web nerobí</h2>
      <ul className="odrazky">
        <li>Nepoužíva cookies ani žiadne sledovanie návštevnosti.</li>
        <li>Nenačítava cudzie skripty, písma ani služby tretích strán.</li>
        <li>Ukážka tréningu nič neukladá a nič neposiela. Výsledky ostávajú len vo vašom prehliadači a zmiznú po zavretí karty.</li>
        <li>Formulár dopytu neodosiela údaje zo stránky. Len pripraví text, ktorý si skopírujete alebo otvoríte vo svojom e-mailovom programe.</li>
      </ul>

      <h2>Kedy vznikajú osobné údaje</h2>
      <p>
        Až vtedy, keď nám pošlete dopyt na adresu {email ? <a href={`mailto:${email}`}>{email}</a> : 'uvedenú na webe'}. Vtedy
        spracúvame údaje, ktoré ste do e-mailu napísali: názov firmy, kontaktný e-mail, prípadne telefón, meno a pozíciu
        kontaktnej osoby a opis situácie, ktorú chcete precvičiť.
      </p>

      <h2>Na čo ich používame</h2>
      <ul className="odrazky">
        <li>na odpoveď na váš dopyt, dohodnutie rozhovoru a prípravu ponuky (rokovanie o zmluve),</li>
        <li>na plnenie dohodnutej zákazky, ak sa na spolupráci dohodneme,</li>
        <li>na evidenciu dokladov, ak to vyžaduje zákon.</li>
      </ul>
      <p>Údaje nepredávame ani neposkytujeme tretím stranám na marketing. Nepoužívame ich na automatické rozhodovanie.</p>

      <h2>Ako dlho ich uchovávame</h2>
      <p>
        Dopyt, z ktorého nevznikla spolupráca, uchovávame najviac 12 mesiacov od poslednej komunikácie a potom ho vymažeme.
        Pri spolupráci uchovávame podklady a komunikáciu počas trvania zákazky a po nej len to, čo vyžadujú účtovné a daňové
        predpisy.
      </p>

      <h2>Vaše práva</h2>
      <p>
        Máte právo na prístup k svojim údajom, ich opravu alebo vymazanie, obmedzenie spracúvania a právo namietať. Stačí
        napísať na {email ? <a href={`mailto:${email}`}>{email}</a> : 'kontaktnú adresu webu'}. Ak si myslíte, že vaše
        údaje spracúvame nesprávne, môžete sa obrátiť na Úrad na ochranu osobných údajov Slovenskej republiky.
      </p>

      <h2>Klientske tréningy</h2>
      <p>
        Tréning vyrobený pre konkrétnu firmu obsahuje len anonymizované podklady, ktoré firma schválila. Beží v prostredí,
        ktoré si firma zvolí, výsledky pracovníkov nezhromažďuje a mená pracovníkov nežiada.
      </p>

      <p className="bez-tlace">
        <a href={CESTY.web}>Späť na web</a>
      </p>
    </div>
  );
}
