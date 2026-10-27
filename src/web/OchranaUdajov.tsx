import { znacka } from '../config/znacka';
import { CESTY } from '../router';
import { Sadzba } from './sadzba';

/**
 * Ochrana osobných údajov. Web nemá cookies, sledovanie ani vlastný backend; osobné údaje
 * spracúvam až vtedy, keď návštevník pošle dopyt zo svojho e-mailu. Technické záznamy
 * hostingu a e-mailovej schránky vedú ich poskytovatelia.
 */
export function OchranaUdajov() {
  const email = znacka.kontaktEmail;
  return (
    <Sadzba>
      <div className="obal obal--uzky pravne">
        <h1>Ochrana osobných údajov</h1>
        <p className="tlmeny">Platí pre web {znacka.webAdresa.replace('https://', '')} a ukážku tréningu na ňom. Stav k 26. 10. 2026.</p>
        {znacka.poskytovatel && (
          <p>
            Prevádzkovateľ: <strong>{znacka.poskytovatel}</strong>
            {znacka.ico ? `, IČO ${znacka.ico}` : ''}
            {znacka.sidlo ? `, ${znacka.sidlo}` : ''}
            {email ? `, ${email}` : ''}.
          </p>
        )}

        <h2>Čo tento web nerobí</h2>
        <ul className="odrazky">
          <li>Nepoužíva cookies ani žiadne sledovanie návštevnosti.</li>
          <li>Nenačítava cudzie skripty, písma ani analytické či reklamné služby.</li>
          <li>Výsledky ukážky sú len v otvorenej stránke a po jej obnovení zmiznú. Nič sa neukladá ani neposiela.</li>
          <li>Formulár dopytu neodosiela údaje zo stránky. Len pripraví text, ktorý si skopírujete alebo otvoríte vo svojom e-mailovom programe.</li>
        </ul>

        <h2>Hosting a e-mailová schránka</h2>
        <p>
          Web beží na službe GitHub Pages. GitHub Pages ako každý webový server vedie technické záznamy o prístupoch, napríklad IP adresu a
          čas návštevy. Tieto záznamy spracúva GitHub na prevádzku a zabezpečenie služby, ja ich nepoužívam.
        </p>
        <p>
          E-mailová schránka {email ? email : 'uvedená na webe'} je u poskytovateľa Hostinger. Správy, ktoré mi pošlete, sú uložené na jeho
          serveroch.
        </p>

        <h2>Kedy spracúvam osobné údaje</h2>
        <p>
          Až vtedy, keď mi pošlete dopyt na adresu {email ? <a href={`mailto:${email}`}>{email}</a> : 'uvedenú na webe'}. Vtedy spracúvam
          údaje, ktoré ste do e-mailu napísali: názov firmy, kontaktný e-mail, prípadne telefón, meno a pozíciu kontaktnej osoby a opis
          situácie, ktorú chcete precvičiť.
        </p>

        <h2>Na čo ich používam</h2>
        <ul className="odrazky">
          <li>na odpoveď na váš dopyt, dohodnutie rozhovoru a prípravu ponuky (rokovanie o zmluve),</li>
          <li>na plnenie dohodnutej zákazky, ak sa na spolupráci dohodneme,</li>
          <li>na evidenciu dokladov, ak to vyžaduje zákon.</li>
        </ul>
        <p>Údaje nepredávam ani neposkytujem tretím stranám na marketing. Nepoužívam ich na automatické rozhodovanie.</p>

        <h2>Ako dlho ich uchovávam</h2>
        <p>
          Dopyt, z ktorého nevznikla spolupráca, uchovávam najviac 12 mesiacov od poslednej komunikácie a potom ho vymažem. Pri spolupráci
          uchovávam podklady a komunikáciu počas trvania zákazky a po nej len to, čo vyžadujú účtovné a daňové predpisy.
        </p>

        <h2>Vaše práva</h2>
        <p>
          Máte právo na prístup k svojim údajom, ich opravu alebo vymazanie, obmedzenie spracúvania a právo namietať. Stačí napísať na{' '}
          {email ? <a href={`mailto:${email}`}>{email}</a> : 'kontaktnú adresu webu'}. Ak si myslíte, že vaše údaje spracúvam nesprávne,
          môžete sa obrátiť na Úrad na ochranu osobných údajov Slovenskej republiky.
        </p>

        <h2>Klientske tréningy</h2>
        <p>
          Tréning vyrobený pre konkrétnu firmu obsahuje len podklady, ktoré firma schválila, s osobnými údajmi nahradenými modelovými. Beží
          v prostredí, ktoré si firma zvolí, a výsledky pracovníkov nezhromažďuje. Meno pracovníka je len nepovinné pole na výtlačok a nikam
          sa neposiela.
        </p>

        <p className="bez-tlace">
          <a href={CESTY.web}>Späť na web</a>
        </p>
      </div>
    </Sadzba>
  );
}
