import { balicky, formatEur, znacka } from '../config/znacka';
import { CESTY } from '../router';
import { mailtoJednaVeta } from './kontakt';
import { Sadzba } from './sadzba';

/**
 * Podmienky pilotu na webe. Obsah drží rovnaký zmysel ako docs/PODMIENKY_PILOTU.md
 * (z neho sa robí PDF na poslanie klientovi); pri zmene upraviť oboje.
 */
export function Podmienky() {
  const pilot = balicky.find((b) => b.id === 'pilot');
  const rozsirenie = balicky.find((b) => b.id === 'rozsirenie');
  const cena = formatEur(pilot?.cena ?? 690);

  return (
    <Sadzba>
      <div className="obal obal--uzky pravne">
        <h1>Podmienky pilotu</h1>
        <p className="tlmeny">Platí pre pilot: tri situácie pre jednu pracovnú pozíciu. Stav k 26. 10. 2026.</p>

        <h2>1. Čo dostanete</h2>
        <ul className="odrazky">
          <li>
            Tri situácie pre jednu pracovnú pozíciu, každá na 2 až 5 minút a s 2 až 4 rozhodnutiami. Vyrobené z vašich chýb, produktov a
            pravidiel.
          </li>
          <li>Váš názov, logo a farbu.</li>
          <li>
            Hotový tréning ako obyčajnú webovú stránku: v prehliadači na počítači aj v mobile, bez inštalácie a účtov. Nový človek si na
            konci súhrn vytlačí alebo uloží ako PDF a pošle vám ho. Tréning sám nič neukladá ani neposiela.
          </li>
          <li>Zdrojové súbory situácií, zoznam schválených pravidiel a krátky návod na úpravu textov.</li>
        </ul>

        <h2>2. Čo potrebujem od vás</h2>
        <ul className="odrazky">
          <li>Jeden rozhovor s vedúcim, približne hodinu: tri chyby, ktoré sa opakujú, a správny postup pri každej.</li>
          <li>
            Niekoľko príkladov (e-maily, objednávky, formuláre), ideálne bez osobných údajov. Ak v nich nejaké ostanú, nahradím ich
            modelovými.
          </li>
          <li>Jedného človeka, ktorý obsah schváli. Správne odpovede určujete vy, nič si nedomýšľam.</li>
        </ul>
        <p>Spolu 2 až 3 hodiny vášho času.</p>

        <h2>3. Ako to prebieha</h2>
        <ol className="odrazky">
          <li>Rozhovor a podklady. Do 5 pracovných dní od rozhovoru a podkladov vám pošlem všetky tri situácie ako text na schválenie.</li>
          <li>
            Po schválení tréning vyrobím. Hotový tréning do 10 pracovných dní od úplných podkladov. Čas, keď čakám na vaše schválenie, sa do
            lehoty nepočíta. Presný termín potvrdím pri objednávke.
          </li>
          <li>Odovzdanie a jedno súhrnné kolo úprav: pripomienky v jednom zozname do 10 pracovných dní od odovzdania zapracujem v cene.</li>
        </ol>

        <h2>4. Cena a platba</h2>
        <ul className="odrazky">
          <li>
            Celý pilot stojí {cena}. Jednorazová cena, žiadne predplatné ani poplatky za používanie.
            {znacka.dphPoznamka ? ` ${znacka.dphPoznamka}` : ''}
          </li>
          <li>Polovica pri objednávke, druhá polovica pri odovzdaní. Bankovým prevodom podľa výzvy na úhradu, ktorú pošlem s potvrdením objednávky.</li>
          <li>Zaplatené sumy sa nevracajú. Ak sa niečo v tréningu nezhoduje so schváleným zadaním, opravím to v cene.</li>
        </ul>

        <h2>5. Čo nie je v cene</h2>
        <ul className="odrazky">
          <li>
            Prevádzka tréningu (u vás alebo u mňa), napojenie na firemné systémy, ďalšie jazyky a ďalšie pozície: dohodneme osobitne a cenu
            poviem vopred.
          </li>
          <li>
            Nové situácie alebo zmenené pravidlá po odovzdaní sú rozšírenie: 5 nových situácií a jedno kolo úprav za{' '}
            {formatEur(rozsirenie?.cena ?? 490)}.
          </li>
        </ul>

        <h2>6. Dôvernosť a vlastníctvo</h2>
        <ul className="odrazky">
          <li>
            Vaše podklady a hotový tréning sú dôverné. Nezverejním ich a bez vášho súhlasu vás neuvediem ako referenciu. Osobné údaje v
            podkladoch nahradím modelovými a pôvodné podklady po odovzdaní zmažem.
          </li>
          <li>Po zaplatení je hotový tréning aj jeho obsah váš. Používate ho bez obmedzenia a bez ďalších poplatkov.</li>
        </ul>

        <h2>7. Ako objednať</h2>
        <p>
          Napíšte mi jednou vetou, kde sa nový človek najčastejšie pomýli. Pošlem ponuku s rozsahom, cenou a termínom. Po vašom súhlase
          pošlem potvrdenie objednávky a výzvu na úhradu prvej polovice.
        </p>
        {znacka.kontaktEmail && (
          <p>
            <a className="tlacidlo tlacidlo--hlavne" href={mailtoJednaVeta()}>
              Napísať e-mail
            </a>{' '}
            <span className="tlmeny">alebo napíšte na {znacka.kontaktEmail}</span>
          </p>
        )}

        <p className="bez-tlace">
          <a href={CESTY.web}>Späť na web</a>
        </p>
      </div>
    </Sadzba>
  );
}
