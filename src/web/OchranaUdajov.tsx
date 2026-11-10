import { znacka } from '../config/znacka';
import { CESTY } from '../router';
import { Sadzba } from './sadzba';

/**
 * Ochrana osobných údajov (GDPR čl. 13 a 14, stav 10. 11. 2026). Web nemá cookies, sledovanie ani vlastný
 * backend; osobné údaje spracúvam z dopytu poslaného z e-mailu návštevníka, pri zákazke a pri oslovení firiem
 * e-mailom. Technické záznamy hostingu a e-mailovej schránky vedú ich poskytovatelia.
 */
export function OchranaUdajov() {
  const email = znacka.kontaktEmail;
  const mail = email ? <a href={`mailto:${email}`}>{email}</a> : 'kontaktnú adresu webu';
  return (
    <Sadzba>
      <div className="obal obal--uzky pravne">
        <h1>Ochrana osobných údajov</h1>
        <p className="tlmeny">Platí pre web {znacka.webAdresa.replace('https://', '')} a ukážku tréningu na ňom. Stav k 10. 11. 2026.</p>
        {znacka.poskytovatel ? (
          <p>
            Prevádzkovateľ: <strong>{znacka.poskytovatel}</strong>
            {znacka.ico ? `, IČO ${znacka.ico}` : ''}
            {znacka.zapis ? `, ${znacka.zapis}` : ''}
            {znacka.sidlo ? `, ${znacka.sidlo}` : ''}
            {email ? `, ${email}` : ''}.
          </p>
        ) : (
          <>
            {znacka.ico && (
              <p>
                Prevádzkovateľ: podnikajúca fyzická osoba, IČO {znacka.ico}
                {znacka.zapis ? `, ${znacka.zapis}` : ''}.
              </p>
            )}
            {(email || znacka.telefon) && (
              <p>
                Kontakt na prevádzkovateľa vo veciach osobných údajov:{' '}
                {email && <a href={`mailto:${email}`}>{email}</a>}
                {email && znacka.telefon ? ', ' : ''}
                {znacka.telefon && <a href={`tel:${znacka.telefon.replace(/\s+/g, '')}`}>{znacka.telefon}</a>}.
              </p>
            )}
          </>
        )}

        <h2>Čo tento web nerobí</h2>
        <ul className="odrazky">
          <li>Nepoužíva cookies ani žiadne sledovanie návštevnosti.</li>
          <li>Nenačítava cudzie skripty, písma ani analytické či reklamné služby.</li>
          <li>Výsledky ukážky sú len v otvorenej stránke a po jej obnovení zmiznú. Nič sa neukladá ani neposiela.</li>
          <li>Formulár dopytu neodosiela údaje zo stránky. Len pripraví text, ktorý si skopírujete alebo otvoríte vo svojom e-mailovom programe.</li>
        </ul>

        <h2>Aké údaje spracúvam a prečo</h2>
        <ul className="odrazky">
          <li>
            <strong>Dopyt a ponuka:</strong> údaje, ktoré mi pošlete e-mailom: názov firmy, kontaktný e-mail, prípadne telefón,
            meno a pozíciu kontaktnej osoby a opis situácie, ktorú chcete precvičiť. Právny základ: kroky pred uzavretím zmluvy na
            vašu žiadosť a oprávnený záujem komunikovať s kontaktnou osobou firmy (čl. 6 ods. 1 písm. b) a f) GDPR). Ak spolupráca
            nevznikne, dopyt vymažem najneskôr 12 mesiacov od poslednej komunikácie.
          </li>
          <li>
            <strong>Zákazka:</strong> podklady a komunikácia pri tréningu na mieru. Právny základ: plnenie zmluvy a oprávnený záujem
            komunikovať s kontaktnou osobou zákazníka (čl. 6 ods. 1 písm. b) a f) GDPR). Uchovávam ich počas zákazky a najviac 2 roky
            po nej, keby ste chceli tréning upraviť.
          </li>
          <li>
            <strong>Faktúry:</strong> fakturačné údaje firmy. Právny základ: zákonná povinnosť (čl. 6 ods. 1 písm. c) GDPR).
            Uchovávam ich tak dlho, ako to vyžadujú daňové predpisy (najviac 10 rokov).
          </li>
          <li>
            <strong>Oslovenie e-mailom:</strong> pracovná e-mailová adresa, názov firmy a verejné údaje o nej (napríklad odbor, sídlo
            a veľkosť). Právny základ: oprávnený záujem ponúkať tréningy firmám (čl. 6 ods. 1 písm. f) GDPR). Uchovávam ich najviac
            2 roky od posledného oslovenia.
          </li>
        </ul>
        <p>
          Poskytnutie údajov je dobrovoľné, nie je to zákonná povinnosť, bez kontaktu vám však nemôžem odpovedať ani pripraviť
          tréning. Údaje nepredávam ani neposkytujem tretím stranám na marketing.
        </p>

        <h2>Oslovenie e-mailom</h2>
        <p>
          Firmám a živnostníkom posielam e-mailom ponuku klikacích tréningov pre nových pracovníkov. Pracovnú e-mailovú adresu a
          názov firmy mám z webu firmy alebo z verejných registrov a databáz firiem. Poradie oslovovania určujem podľa verejných
          údajov o firme, napríklad podľa odboru a veľkosti. Nemá to pre vás žiadne právne účinky a automatizovane o vás nerozhodujem.
        </p>
        <p>
          Proti osloveniu môžete kedykoľvek namietať: stačí odpísať jednou vetou a viac vás neoslovím v žiadnej mojej ponuke.
          Ponechám si len vašu adresu, aby som vám nenapísal znova.
        </p>

        <h2>Komu údaje odovzdávam</h2>
        <p>
          Web beží na službe GitHub Pages spoločnosti GitHub, Inc. (USA). GitHub ako každý webový server vedie technické záznamy o
          prístupoch, napríklad IP adresu a čas návštevy, a spracúva ich na prevádzku a zabezpečenie služby, ja ich nepoužívam. Prenos
          do USA prebieha na základe rozhodnutia Európskej komisie o primeranosti (EU-US Data Privacy Framework).
        </p>
        <p>
          E-mailová schránka {email ? email : 'uvedená na webe'} je u poskytovateľa Hostinger International Ltd. (Cyprus). Správy,
          ktoré mi pošlete, sú uložené na jeho serveroch.
        </p>

        <h2>Vaše práva</h2>
        <p>
          Máte právo na prístup k svojim údajom, ich opravu alebo vymazanie, obmedzenie spracúvania, prenosnosť a právo namietať proti
          spracúvaniu na základe oprávneného záujmu vrátane oslovenia e-mailom. Stačí napísať na {mail}, vybavím to najneskôr do
          mesiaca.
        </p>
        <p>
          Ak si myslíte, že vaše údaje spracúvam nesprávne, môžete podať sťažnosť na Úrad na ochranu osobných údajov Slovenskej
          republiky, Hraničná 12, 820 07 Bratislava 27, <a href="https://dataprotection.gov.sk/">dataprotection.gov.sk</a>.
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
