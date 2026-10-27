import { ArrowRight, ArrowsOut, Check, EnvelopeSimple, Phone } from '@phosphor-icons/react';
import { balicky, formatEur, znacka } from '../config/znacka';
import { poradie, useOdhalenie } from '../pohyb';
import { CESTY } from '../router';
import { Dopyt } from './Dopyt';
import { mailtoJednaVeta, mailtoVeducemu } from './kontakt';
import { MiniNahlad } from './MiniNahlad';
import { Sadzba } from './sadzba';
import { SkopirovatAdresu } from './SkopirovatAdresu';

/** Tri chyby z mailu, každá s odkazom na svoju situáciu v ukážke. */
const CHYBY = [
  {
    scenar: 'slubeny-termin',
    kod: 'Termín',
    nadpis: 'Termín potvrdený bez kontroly rezervácií',
    situacia: 'Zákazník chce 8 kusov do piatka. Systém ukazuje 12 na sklade. Nový človek potvrdí.',
    nasledok: 'O 10:30 volá sklad: 9 kusov patrí inej objednávke. Zákazník už má potvrdenie na piatok.',
  },
  {
    scenar: 'kusy-alebo-balenia',
    kod: 'Množstvo',
    nadpis: 'Kusy namiesto balení',
    situacia: 'Zákazník píše 18 kusov. Formulár počíta v baleniach po 6. Nový človek zadá 18.',
    nasledok: 'Odíde 108 kusov a faktúra na 1 512 € namiesto 252 €. Doprava späť, dobropis, nová objednávka.',
  },
  {
    scenar: 'zmena-adresy',
    kod: 'Adresa',
    nadpis: 'Adresa zmenená len v systéme, štítok ostal starý',
    situacia: 'Zásielka je na rampe, štítok vytlačený, odvoz o 15:00. Nový človek prepíše adresu len v systéme.',
    nasledok: 'Sklad expeduje podľa štítku. Zásielka ide na starú adresu a nasleduje opakovaná doprava.',
  },
];

/** Lehoty majú rovnaké znenie ako Podmienky pilotu (src/web/Podmienky.tsx, docs/PODMIENKY_PILOTU.md). */
const KROKY = [
  {
    nadpis: 'Hodinový rozhovor',
    text: 'Poviete mi, ktoré tri chyby sa u vás opakujú a ako je to správne. Na rozhovor nemusíte nič písať.',
  },
  {
    nadpis: 'Texty na schválenie',
    text: 'Do 5 pracovných dní od rozhovoru a podkladov vám pošlem všetky tri situácie ako text na schválenie. Vyrábam, až keď poviete, že sedia.',
  },
  {
    nadpis: 'Výroba a odovzdanie',
    text: 'Hotový tréning do 10 pracovných dní od úplných podkladov. Čas, keď čakám na vaše schválenie, sa do lehoty nepočíta.',
  },
  {
    nadpis: 'Jedno kolo úprav',
    text: 'Pripomienky pošlete v jednom zozname do 10 pracovných dní od odovzdania a zapracujem ich v cene.',
  },
];

/** Ako sa vedúci dozvie výsledok (rovnaké znenie v otázkach a pri snímke súhrnu). */
const VYSLEDOK_PRE_VEDUCEHO = 'Nový človek si na konci súhrn vytlačí alebo uloží ako PDF a pošle vám ho. Tréning sám nič neukladá ani neposiela.';

/**
 * Skutočné výrezy z ukážky (scripts/snimky_webu.mjs), žiadne vymyslené výstupy. Rozmery sú
 * v pixeloch súboru (výrez široký asi 520 CSS px pri dvojnásobnej hustote); po pregenerovaní
 * snímok ich zosúladiť, aby stránka pred načítaním obrázka neposkočila.
 */
const VYSTUPY = [
  {
    obrazok: 'img/ukazka-trening.jpg',
    sirka: 1032,
    vyska: 1442,
    nadpis: 'Tréning s vaším názvom, produktmi a pravidlami',
    text: 'Nový človek dostane situáciu tak, ako príde v práci: e-mail zákazníka, stav v systéme a niekoľko možností. Keď sa pomýli, hneď vidí, čo chyba spôsobila, a môže ju napraviť.',
    alt: 'Rozhodnutie v tréningu: otázka a možnosti, z ktorých nový človek vyberá.',
  },
  {
    obrazok: 'img/ukazka-veduci.jpg',
    sirka: 1032,
    vyska: 702,
    nadpis: 'Súhrn pre vedúceho',
    text: 'Na konci je súhrn: ktoré situácie zvládol, kde sa pomýlil a čo si opravil po spätnej väzbe.',
    poznamka: VYSLEDOK_PRE_VEDUCEHO,
    alt: 'Karta Záver zo stránky Čo uvidí vedúci: výsledok situácií a kontrolné body.',
  },
  {
    obrazok: 'img/ukazka-pravidla.jpg',
    sirka: 1032,
    vyska: 864,
    nadpis: 'Pravidlá spísané z rozhovoru',
    text: 'Postup, ktorý mi poviete, spíšem ako pravidlá firmy. Schváli ich váš človek a v tréningu sú stále po ruke ako podklad.',
    alt: 'Panel Pravidlá firmy so spísaným postupom.',
  },
];

const OTAZKY: { otazka: string; odpoved: string }[] = [
  {
    otazka: 'Nového človeka prijímame len občas. Oplatí sa to?',
    odpoved: 'Tréning prejde aj brigádnik, zástup počas dovolenky alebo kolega, ktorý robí stále tú istú chybu. Platíte jednorazovo a tréning ostáva vám.',
  },
  {
    otazka: 'Zaučíme ho aj sami. Načo nám to je?',
    odpoved: 'Zaučenie to nenahradí. Nahradí tú časť, keď desiaty raz vysvetľujete to isté, a chybu presunie z ostrej objednávky do tréningu.',
  },
  {
    otazka: 'Ako sa dozviem, ako to nový človek zvládol?',
    odpoved: VYSLEDOK_PRE_VEDUCEHO,
  },
  {
    otazka: 'Kto určuje, čo je správne?',
    odpoved: 'Vy. Správny postup beriem len z vašich pravidiel a pred výrobou ho schváli váš človek. Nič si nedomýšľam.',
  },
  {
    otazka: 'Ako sa platí?',
    odpoved: 'Polovicu pri objednávke, druhú pri odovzdaní, bankovým prevodom. Žiadne predplatné ani licencia.',
  },
  {
    otazka: 'Čo ak výsledok nebude sedieť?',
    odpoved: 'Najprv schválite texty všetkých troch situácií, vyrábam až potom. Rozpor so schváleným zadaním opravím v cene.',
  },
  {
    otazka: 'Komu patrí tréning a naše podklady?',
    odpoved: 'Vám. Podklady sú dôverné, osobné údaje v nich nahradím modelovými a bez vášho súhlasu vás neuvediem ako referenciu.',
  },
  {
    otazka: 'Nemáme spísané postupy. Vadí to?',
    odpoved: 'Nie. Postupy zachytím z rozhovoru a spíšem ich. Spísaný postup potom ostane vám.',
  },
];

/** Návšteva z odkazu v maile má v adrese ?z=… (nič sa neukladá ani neposiela). */
function prisielZMailu(): boolean {
  if (typeof window === 'undefined') return false;
  return new URLSearchParams(window.location.search).has('z');
}

export function Landing() {
  const pilot = balicky.find((b) => b.id === 'pilot');
  const ostatne = balicky.filter((b) => b.id !== 'pilot');
  const zMailu = prisielZMailu();
  // Prvky s data-odhal sa pri prvom príchode do okna jemne vysunú (src/pohyb.ts, styles.css).
  useOdhalenie();

  return (
    <Sadzba>
      {zMailu && (
        <p className="pas-z-mailu">
          <span className="obal">Ak ste dostali môj e-mail, stačí naň odpovedať, aj jednou vetou.</span>
        </p>
      )}

      {/* Hero: pre koho, sľub, ukážka hneď vedľa. Pri načítaní sa nadznak, tlačidlá a cena poskladajú
          v sérii. Nadpis H1 a podtext stoja: sú to najväčšie texty v okne (v mobile je najväčší podtext)
          a nesmú čakať na animáciu. */}
      <section className="hero" aria-labelledby="hero-nadpis">
        <div className="obal hero__mriezka">
          <div className="hero__text">
            <p className="nadznak hero__vstup" style={poradie(0)}>
              Pre veľkoobchody a distribúciu: príjem objednávok
            </p>
            <h1 id="hero-nadpis" className="hero__nadpis">
              Nový človek na objednávkach sa pomýli v tréningu, nie u vášho zákazníka.
            </h1>
            <p className="hero__podtext">
              Zlý termín, kusy namiesto balení, adresa zmenená len v systéme. Z troch chýb, ktoré sa opakujú u vás, pripravím krátky
              tréning v prehliadači s vašimi produktmi a pravidlami. Prejde ho nový človek, brigádnik aj zástup počas dovolenky.
            </p>
            <div className="hero__akcie hero__vstup" style={poradie(1)}>
              <a className="tlacidlo tlacidlo--hlavne tlacidlo--velke" href={CESTY.scenar('slubeny-termin')}>
                Vyskúšať jednu situáciu
                <span className="tlacidlo__ikona" aria-hidden="true">
                  <ArrowRight size={18} weight="bold" />
                </span>
              </a>
              <a className="tlacidlo tlacidlo--druhotne tlacidlo--velke" href="#dopyt">
                Napísať jednou vetou
              </a>
            </div>
            <p className="hero__cena hero__vstup" style={poradie(2)}>
              <strong>Pilot: 3 situácie z vašej firmy za {formatEur(pilot?.cena ?? 690)}.</strong> Jednorazová cena, bez predplatného.
            </p>
            <p className="hero__veducemu male hero__vstup" style={poradie(3)}>
              Nerozhodujete o tom vy? <a href={mailtoVeducemu()}>Poslať odkaz vedúcemu</a>
            </p>
          </div>
          <div className="hero__ukazka-stlpec">
            <MiniNahlad />
            <p className="hero__popis">Príklad z vymysleného technického veľkoobchodu. U vás to budú vaše produkty a vaše pravidlá.</p>
          </div>
        </div>
      </section>

      {/* Tri chyby z mailu: rozpoznanie bolesti a vstup do ukážky */}
      <section className="sekcia" id="ukazka" aria-labelledby="chyby-nadpis">
        <div className="obal">
          <h2 id="chyby-nadpis" className="sekcia__nadpis">
            Ktorá z týchto chýb sa u vás stala naposledy?
          </h2>
          <p className="sekcia__uvod">
            Každú si môžete prejsť ako nový človek. Uvidíte, čo spôsobí, a skúsite to znova.
          </p>
          <ol className="chyby">
            {CHYBY.map((ch, i) => (
              <li key={ch.scenar} className="doklad" data-odhal>
                <p className="doklad__hlavicka mono">
                  <span>Situácia {i + 1}</span>
                  <span>{ch.kod}</span>
                </p>
                <h3 className="doklad__nadpis">{ch.nadpis}</h3>
                <p className="doklad__text">{ch.situacia}</p>
                <p className="doklad__nasledok">
                  <span className="doklad__stitok">Následok</span>
                  {ch.nasledok}
                </p>
                <a className="doklad__odkaz" href={CESTY.scenar(ch.scenar)}>
                  Vyskúšať túto situáciu
                  <ArrowRight size={16} weight="bold" aria-hidden="true" />
                </a>
              </li>
            ))}
          </ol>

          <div className="pre-koho" data-odhal>
            <div>
              <h3 className="pre-koho__nadpis">Má to zmysel, ak</h3>
              <ul className="zoznam-fajky">
                <li>
                  <Check size={18} weight="bold" aria-hidden="true" />
                  sa na objednávkach strieda viac ľudí: nový človek, brigádnik, zástup počas dovolenky alebo PN,
                </li>
                <li>
                  <Check size={18} weight="bold" aria-hidden="true" />
                  ste tú istú chybu riešili viackrát,
                </li>
                <li>
                  <Check size={18} weight="bold" aria-hidden="true" />
                  niekto vo firme vie povedať, ako je to správne.
                </li>
              </ul>
            </div>
            <p className="pre-koho__nie">
              <strong>Nemá to zmysel,</strong> ak nového človeka beriete raz za pár rokov a chyby sa neopakujú. Vtedy stačí, keď mu to
              ukáže vedúci.
            </p>
          </div>
        </div>
      </section>

      {/* Čo dostanete: výrezy zo skutočnej ukážky, každý s popisom vedľa; celý rozsah je pri cene */}
      <section className="sekcia sekcia--jemna" id="co-dostanete" aria-labelledby="vystupy-nadpis">
        <div className="obal">
          <h2 id="vystupy-nadpis" className="sekcia__nadpis">
            Čo dostanete
          </h2>
          <ul className="vystupy">
            {VYSTUPY.map((v) => (
              <li key={v.obrazok} className="vystup">
                <figure className="vystup__snimka" data-odhal>
                  <a className="vystup__ram" href={v.obrazok} target="_blank" rel="noopener">
                    {/* Okno so zaoblením orezáva snímku, ktorá sa pod myšou jemne priblíži. */}
                    <span className="vystup__okno">
                      <img src={v.obrazok} alt={v.alt} width={v.sirka} height={v.vyska} loading="lazy" decoding="async" />
                    </span>
                    <span className="vystup__zvacsit">
                      <ArrowsOut size={16} weight="bold" aria-hidden="true" />
                      Zväčšiť
                    </span>
                  </a>
                </figure>
                <div className="vystup__text" data-odhal>
                  <h3 className="vystup__nadpis">{v.nadpis}</h3>
                  <p>{v.text}</p>
                  {v.poznamka && <p className="vystup__poznamka">{v.poznamka}</p>}
                </div>
              </li>
            ))}
          </ul>
          <p className="vystupy__navyse">
            K tréningu dostanete aj zdrojové súbory, spísané pravidlá a krátky návod na úpravu textov. Po zaplatení je tréning aj jeho obsah
            váš. <a href="#cennik">Rozsah a cena</a>
          </p>
        </div>
      </section>

      {/* Ako to prebieha: lehoty z podmienok pilotu */}
      <section className="sekcia" id="ako" aria-labelledby="ako-nadpis">
        <div className="obal">
          <h2 id="ako-nadpis" className="sekcia__nadpis">
            Ako to prebieha
          </h2>
          <ol className="postup-krokov">
            {KROKY.map((k, i) => (
              <li key={k.nadpis} className="krok" data-odhal>
                <span className="krok__cislo mono" aria-hidden="true">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="krok__nadpis">{k.nadpis}</h3>
                <p className="krok__text">{k.text}</p>
              </li>
            ))}
          </ol>
          <p className="postup__cas">
            <strong>Váš čas:</strong> hodinový rozhovor, pár príkladov a jedno schválenie. Spolu 2 až 3 hodiny.
          </p>
        </div>
      </section>

      {/* Cena: v mobile najprv karta pilotu, až potom ďalšie možnosti */}
      <section className="sekcia sekcia--jemna" id="cennik" aria-labelledby="cena-nadpis">
        <div className="obal cena-mriezka">
          <div className="cena__hlava">
            <h2 id="cena-nadpis" className="sekcia__nadpis">
              Koľko to stojí
            </h2>
            <p className="sekcia__uvod">
              Začína sa tromi situáciami pre jednu pozíciu. Jednorazová cena, bez predplatného.
              {znacka.dphPoznamka ? ` ${znacka.dphPoznamka}` : ''}
            </p>
          </div>
          {pilot && (
            <div className="cena__karta" data-odhal>
              <p className="cena__stitok mono">Pilot</p>
              <h3 className="cena__nazov">Tri situácie z vašej firmy</h3>
              <p className="cena__suma">
                <span className="cena__suma-hodnota">{formatEur(pilot.cena)}</span>
                <span className="cena__poznamka">jednorazovo</span>
              </p>
              <ul className="zoznam-fajky">
                {pilot.rozsah.map((r) => (
                  <li key={r}>
                    <Check size={18} weight="bold" aria-hidden="true" />
                    {r}
                  </li>
                ))}
                <li>
                  <Check size={18} weight="bold" aria-hidden="true" />
                  hotový tréning do 10 pracovných dní od úplných podkladov
                </li>
              </ul>
              <a className="tlacidlo tlacidlo--hlavne tlacidlo--velke tlacidlo--cely" href="#dopyt">
                Chcem ponuku pre našu firmu
                <span className="tlacidlo__ikona" aria-hidden="true">
                  <ArrowRight size={18} weight="bold" />
                </span>
              </a>
              <p className="male tlmeny cena__dolna">
                Polovicu platíte pri objednávke, druhú pri odovzdaní. Ak sa tréning nezhoduje so schváleným zadaním, opravím ho v cene.{' '}
                <a href={CESTY.podmienky}>Podmienky pilotu</a>
              </p>
            </div>
          )}
          <div className="cena__dalsie" data-odhal>
            <p id="cena-dalsie" className="cena__dalsie-nadpis mono">
              Ďalšie možnosti
            </p>
            <ul className="cena__ostatne" aria-labelledby="cena-dalsie">
              {ostatne.map((b) => (
                <li key={b.id} className="cena__riadok">
                  <div>
                    <strong>{b.nazov}</strong>
                    <span className="cena__riadok-popis">{popisRiadku(b.id, b.rozsah)}</span>
                  </div>
                  <span className="cena__riadok-suma">{formatEur(b.cena)}</span>
                </li>
              ))}
            </ul>
            <p className="tlmeny male">
              Kde bude tréning bežať, u vás alebo u mňa, dohodneme v ponuke a cenu poviem vopred. Napojenie na firemné systémy, ďalšie jazyky
              a ďalšie pozície sa dohodnú osobitne.
            </p>
          </div>
        </div>
      </section>

      {znacka.poskytovatel && <KtoToRobi />}

      {/* Otázky: námietky malej firmy */}
      <section className="sekcia" id="otazky" aria-labelledby="otazky-nadpis">
        <div className="obal">
          <h2 id="otazky-nadpis" className="sekcia__nadpis">
            Časté otázky
          </h2>
          <dl className="faq-mriezka">
            {OTAZKY.map((o) => (
              <div key={o.otazka} className="faq__polozka">
                <dt>{o.otazka}</dt>
                <dd>{o.odpoved}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Kontakt: jedna veta z vlastného e-mailu, formulár až na požiadanie */}
      <section className="sekcia sekcia--kontakt" id="dopyt" aria-labelledby="dopyt-nadpis">
        <div className="obal kontakt-mriezka">
          <div className="kontakt__uvod">
            <h2 id="dopyt-nadpis" className="sekcia__nadpis">
              Napíšte mi jednou vetou, kde sa u vás nový človek najčastejšie pomýli
            </h2>
            <p className="sekcia__uvod">
              Napríklad: „Potvrdí termín bez kontroly rezervácií.“ Odpíšem, či sa to na tréning hodí, a pošlem ponuku s rozsahom, cenou a
              termínom. Objednávate až potom.
            </p>
            {znacka.poskytovatel && (
              <p className="kontakt__podpis">
                Píšete priamo mne: <strong>{znacka.poskytovatel}</strong>
              </p>
            )}
          </div>
          <div className="kontakt__karta" data-odhal>
            {znacka.kontaktEmail && (
              <>
                <a className="tlacidlo tlacidlo--hlavne tlacidlo--velke tlacidlo--cely" href={mailtoJednaVeta()}>
                  <EnvelopeSimple size={20} weight="bold" aria-hidden="true" />
                  Napísať e-mail
                </a>
                <p className="kontakt__adresa mono">{znacka.kontaktEmail}</p>
                <SkopirovatAdresu adresa={znacka.kontaktEmail} />
              </>
            )}
            {znacka.telefon && (
              <a className="tlacidlo tlacidlo--druhotne tlacidlo--cely" href={`tel:${znacka.telefon.replace(/\s+/g, '')}`}>
                <Phone size={20} weight="bold" aria-hidden="true" />
                Zavolať {znacka.telefon}
              </a>
            )}
            <ul className="kontakt__poznamky male">
              <li>Dostali ste odo mňa e-mail? Stačí naň odpovedať.</li>
              <li>Otvorí sa váš e-mailový program. Zo stránky sa nič neodosiela.</li>
              {znacka.odpovedDo && <li>Odpovedám do {znacka.odpovedDo}.</li>}
              <li>
                Nerozhodujete o tom vy? <a href={mailtoVeducemu()}>Poslať odkaz vedúcemu</a>
              </li>
            </ul>
            <details className="kontakt__formular">
              <summary>Radšej vyplním krátky formulár</summary>
              <Dopyt />
            </details>
          </div>
        </div>
      </section>
    </Sadzba>
  );
}

/** Krátky popis riadku cenníka; pri rozšírení vysvetlí, prečo vychádza situácia lacnejšie. */
function popisRiadku(id: string, rozsah: string[]): string {
  if (id === 'rozsirenie') return '5 nových situácií k hotovému tréningu. Rozhovor a nastavenie sú už hotové, preto vychádza situácia lacnejšie.';
  // Bodkočiarka: položka „váš názov, logo a farba“ má čiarky v sebe.
  return rozsah.join('; ');
}

/** Sekcia o poskytovateľovi. Vykreslí sa len vtedy, keď je v znacka.ts vyplnené meno. */
function KtoToRobi() {
  return (
    <Sadzba>
      <section className="sekcia" id="kto" aria-labelledby="kto-nadpis">
        <div className="obal kto">
          {znacka.fotka && <img className="kto__fotka" src={znacka.fotka} alt={znacka.poskytovatel} width={160} height={160} />}
          <div>
            <h2 id="kto-nadpis" className="sekcia__nadpis">
              Kto to robí
            </h2>
            <p className="sekcia__uvod">
              Volám sa {znacka.poskytovatel}. Tréningy robím sám, od rozhovoru s vedúcim po hotovú stránku. Každú situáciu pred výrobou
              schváli váš človek.
            </p>
            <p className="kto__udaje">
              {[znacka.telefon, znacka.kontaktEmail, znacka.ico ? `IČO ${znacka.ico}` : '', znacka.sidlo].filter(Boolean).join(' · ')}
            </p>
          </div>
        </div>
      </section>
    </Sadzba>
  );
}
