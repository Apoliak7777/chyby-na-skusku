import { useState } from 'react';
import {
  ArrowRight,
  CalendarCheck,
  ChatCircleText,
  Check,
  Clock,
  DeviceMobile,
  FileText,
  MonitorPlay,
  Package,
  PencilSimpleLine,
  ShieldCheck,
  Truck,
  UsersThree,
} from '@phosphor-icons/react';
import { trening } from '@trening';
import { balicky, formatEur, znacka } from '../config/znacka';
import { CESTY } from '../router';
import { Dopyt } from './Dopyt';
import { MiniNahlad } from './MiniNahlad';

const CTA_PILOT = 'Chcem pilot za 690 €';

const KROKY = [
  {
    ikona: ChatCircleText,
    nadpis: 'Poviete nám tri chyby',
    text: 'Hodina rozhovoru s vedúcim. Nič nemusíte písať.',
  },
  {
    ikona: PencilSimpleLine,
    nadpis: 'Vyrobíme klikací tréning',
    text: 'Do 10 pracovných dní. Čo je správne, schválite vy.',
  },
  {
    ikona: MonitorPlay,
    nadpis: 'Nováčik si to vyskúša nanečisto',
    text: 'V prehliadači, na počítači aj mobile. Bez inštalácie.',
  },
];

const VYHODY = [
  {
    ikona: Clock,
    nadpis: 'Vedúci nevysvetľuje desiaty raz to isté',
    text: 'Postup je v tréningu. Nováčik si ho prejde sám, aj viackrát.',
  },
  {
    ikona: ShieldCheck,
    nadpis: 'Chyba sa stane v tréningu, nie u zákazníka',
    text: 'Zlá voľba ukáže následok. Bez reklamácie, bez dopravy naspäť.',
  },
  {
    ikona: UsersThree,
    nadpis: 'Všetci robia rovnaký postup',
    text: 'Správne odpovede určujete vy. Tréning ich drží pre každého rovnako.',
  },
  {
    ikona: DeviceMobile,
    nadpis: 'Nič nemusíte inštalovať',
    text: 'Obyčajná webová stránka. Funguje na počítači aj v mobile.',
  },
];

const OTAZKY: { otazka: string; odpoved: string }[] = [
  {
    otazka: 'Ako to prispôsobíte našej firme?',
    odpoved: 'Situácie sú z vašich prípadov: vaše produkty, formuláre, pravidlá. Podklady anonymizujeme, osobné údaje nepotrebujeme.',
  },
  {
    otazka: 'Koľko času nám to zaberie?',
    odpoved: 'Jeden hodinový rozhovor, pár príkladov e-mailov alebo objednávok a jedno schválenie. Spolu 2 až 3 hodiny za celý pilot.',
  },
  {
    otazka: 'Kto určuje správne odpovede?',
    odpoved: 'Vy. Správne postupy berieme len z vašich pravidiel a pred výrobou ich schváli váš človek. Nič si nedomýšľame.',
  },
  {
    otazka: 'Potrebujú naši ľudia platené AI?',
    odpoved: 'Nie. Hotový tréning je obyčajná stránka. Pracovník nepotrebuje účet ani žiadny program.',
  },
  {
    otazka: 'Dá sa obsah neskôr meniť?',
    odpoved: 'Áno. Texty upravíte podľa návodu, nové situácie alebo zmenené pravidlá riešime ako rozšírenie.',
  },
  {
    otazka: 'Kde tréning beží?',
    odpoved: 'Kde chcete: u vás vo firemnej sieti, na vašom hostingu alebo u nás. Interný tréning patrí za prihlásenie.',
  },
  {
    otazka: 'Nemáme spísané postupy. Vadí to?',
    odpoved: 'Nie. Postupy zachytíme z rozhovoru a spíšeme ich. Výsledok schváli váš zodpovedný človek.',
  },
  {
    otazka: 'Ako vyzerá pilot?',
    odpoved: `Tri situácie pre jednu pozíciu, rozhovor, vaše označenie a jedno kolo úprav za ${formatEur(690)}. Potom sa pozrieme, či sa tréning naozaj používa.`,
  },
];

export function Landing() {
  const [balicek, setBalicek] = useState('');
  const scenare = trening.scenare;
  const pilot = balicky.find((b) => b.id === 'pilot');
  const ostatne = balicky.filter((b) => b.id !== 'pilot');
  const ikonyScenarov = [CalendarCheck, Package, Truck];

  return (
    <>
      {/* Hero: text vľavo, živá ukážka vpravo */}
      <section className="hero" aria-labelledby="hero-nadpis">
        <div className="obal hero__mriezka">
          <div className="hero__text">
            <h1 id="hero-nadpis" className="hero__nadpis" style={{ ['--i' as string]: 0 }}>
              Nech si nováčik prvú chybu vyskúša nanečisto.
            </h1>
            <p className="hero__podtext" style={{ ['--i' as string]: 1 }}>
              Z troch chýb, ktoré sa u vás opakujú, spravíme klikací tréning. Nový človek ich urobí v tréningu, nie u zákazníka.
            </p>
            <div className="hero__akcie" style={{ ['--i' as string]: 2 }}>
              <a className="tlacidlo tlacidlo--hlavne tlacidlo--velke" href={CESTY.demo}>
                Vyskúšať ukážku
                <span className="tlacidlo__ikona" aria-hidden="true">
                  <ArrowRight size={18} weight="bold" />
                </span>
              </a>
              <a className="tlacidlo tlacidlo--druhotne tlacidlo--velke" href="#dopyt" onClick={() => setBalicek('pilot')}>
                {CTA_PILOT}
              </a>
            </div>
          </div>
          <div className="hero__ukazka-stlpec" style={{ ['--i' as string]: 1 }}>
            <MiniNahlad />
            <p className="hero__popis">Bez registrácie. Modelové situácie vymyslenej firmy.</p>
          </div>
        </div>
      </section>

      {/* Poznáte to? Veľký výrok, jedna myšlienka */}
      <section className="sekcia sekcia--vyrok odhal" id="situacia" aria-labelledby="vyrok-nadpis">
        <div className="obal obal--stredny">
          <h2 id="vyrok-nadpis" className="sekcia__nadpis">
            Poznáte to?
          </h2>
          <p className="vyrok">
            Nový človek potvrdí termín. <span className="zvyraz">Tovar nie je.</span> Vedúci to rieši. Zákazník čaká.
          </p>
          <p className="sekcia__uvod">
            Takéto situácie dáme do tréningu. Nováčik ich preklikne, urobí chybu, uvidí, čo sa stane, a skúsi to znova. Keď to potom
            robí naozaj, už vie.
          </p>
        </div>
      </section>

      {/* Ako to funguje: tri kroky na jednej línii */}
      <section className="sekcia odhal" id="ako" aria-labelledby="ako-nadpis">
        <div className="obal">
          <h2 id="ako-nadpis" className="sekcia__nadpis">
            Ako to funguje
          </h2>
          <ol className="kroky-linia">
            {KROKY.map((k, i) => {
              const Ikona = k.ikona;
              return (
                <li key={i} className="krok">
                  <span className="krok__cislo" aria-hidden="true">
                    {i + 1}
                  </span>
                  <span className="krok__ikona" aria-hidden="true">
                    <Ikona size={26} weight="regular" />
                  </span>
                  <h3 className="krok__nadpis">{k.nadpis}</h3>
                  <p className="krok__text">{k.text}</p>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      {/* Ukážka: bento s jedným veľkým a dvoma menšími dlaždicami */}
      <section className="sekcia sekcia--jemna odhal" id="ukazka" aria-labelledby="ukazka-nadpis">
        <div className="obal">
          <h2 id="ukazka-nadpis" className="sekcia__nadpis">
            Vyskúšajte si tri situácie
          </h2>
          <p className="sekcia__uvod">
            Vymyslená firma DEMO DISTRIBÚCIA, príjem objednávok. Každá situácia trvá 3 až 5 minút a dá sa zopakovať.
          </p>
          <div className="bento">
            {scenare.map((s, i) => {
              const Ikona = ikonyScenarov[i] ?? CalendarCheck;
              return (
                <a
                  key={s.id}
                  className={`bento__dlazdica${i === 0 ? ' bento__dlazdica--velka' : ''}`}
                  href={CESTY.scenar(s.id)}
                  aria-label={`Otvoriť situáciu ${i + 1}: ${s.nazov}`}
                >
                  <span className="bento__ikona" aria-hidden="true">
                    <Ikona size={28} weight="regular" />
                  </span>
                  <span className="bento__poradie">Situácia {i + 1}</span>
                  <span className="bento__nadpis">{s.nazov}</span>
                  <span className="bento__text">{s.strucnyProblem}</span>
                  {i === 0 && (
                    <span className="bento__cisla" aria-hidden="true">
                      <span>
                        <strong>12</strong> na sklade
                      </span>
                      <span>
                        <strong>9</strong> rezervovaných
                      </span>
                      <span>
                        <strong>3</strong> voľné
                      </span>
                    </span>
                  )}
                  <span className="bento__odkaz">
                    Otvoriť situáciu
                    <ArrowRight size={16} weight="bold" aria-hidden="true" />
                  </span>
                </a>
              );
            })}
          </div>
        </div>
      </section>

      {/* Čo z toho máte: štyri výhody, dva stĺpce, bez kariet */}
      <section className="sekcia odhal" id="co-dostanete" aria-labelledby="vyhody-nadpis">
        <div className="obal">
          <h2 id="vyhody-nadpis" className="sekcia__nadpis">
            Čo z toho máte
          </h2>
          <ul className="vyhody">
            {VYHODY.map((v, i) => {
              const Ikona = v.ikona;
              return (
                <li key={i} className="vyhoda">
                  <span className="vyhoda__ikona" aria-hidden="true">
                    <Ikona size={24} weight="regular" />
                  </span>
                  <div>
                    <h3 className="vyhoda__nadpis">{v.nadpis}</h3>
                    <p className="vyhoda__text">{v.text}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* Cena: jeden odporúčaný balík, ostatné ako riadky */}
      <section className="sekcia sekcia--jemna odhal" id="cennik" aria-labelledby="cena-nadpis">
        <div className="obal cena-mriezka">
          <div className="cena__text">
            <h2 id="cena-nadpis" className="sekcia__nadpis">
              Koľko to stojí
            </h2>
            <p className="sekcia__uvod">
              Začnite pilotom. Platíte raz, za hotový tréning. Žiadne predplatné, žiadna licencia.
              {znacka.dphPoznamka ? ` ${znacka.dphPoznamka}` : ''}
            </p>
            <ul className="cena__ostatne" aria-label="Ďalšie balíčky">
              {ostatne.map((b) => (
                <li key={b.id} className="cena__riadok">
                  <div>
                    <strong>{b.nazov}</strong>
                    <span className="tlmeny"> {b.rozsah[0]}</span>
                  </div>
                  <span className="cena__riadok-suma">{formatEur(b.cena)}</span>
                </li>
              ))}
            </ul>
            <p className="tlmeny male">
              Osobitne sa dohodne hosting, napojenie na firemné systémy, ďalšie jazyky a nové pozície. Oprava rozporu so schváleným zadaním je
              v cene, nový obsah je rozšírenie.
            </p>
          </div>
          {pilot && (
            <div className="bezel cena__hlavna">
              <div className="bezel__jadro cena__jadro">
                <p className="cena__stitok">Odporúčaný začiatok</p>
                <h3 className="cena__nazov">{pilot.nazov}</h3>
                <p className="cena__suma">
                  {formatEur(pilot.cena)} <span className="cena__poznamka">úvodná cena</span>
                </p>
                <ul className="cena__zoznam">
                  {pilot.rozsah.map((r, i) => (
                    <li key={i}>
                      <Check size={18} weight="bold" aria-hidden="true" />
                      {r}
                    </li>
                  ))}
                  <li>
                    <Check size={18} weight="bold" aria-hidden="true" />
                    hotové do 10 pracovných dní od podkladov
                  </li>
                </ul>
                <a className="tlacidlo tlacidlo--hlavne tlacidlo--velke tlacidlo--cely" href="#dopyt" onClick={() => setBalicek('pilot')}>
                  {CTA_PILOT}
                  <span className="tlacidlo__ikona" aria-hidden="true">
                    <ArrowRight size={18} weight="bold" />
                  </span>
                </a>
                <p className="tlmeny male cena__dolna">Na overenie, či sa tréning u vás naozaj používa. Termín potvrdíme pri prvej zákazke.</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Otázky: dva stĺpce krátkych odpovedí */}
      <section className="sekcia odhal" id="otazky" aria-labelledby="otazky-nadpis">
        <div className="obal">
          <h2 id="otazky-nadpis" className="sekcia__nadpis">
            Časté otázky
          </h2>
          <dl className="faq-mriezka">
            {OTAZKY.map((o, i) => (
              <div key={i} className="faq__polozka">
                <dt>{o.otazka}</dt>
                <dd>{o.odpoved}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Dopyt: čo sa stane potom + formulár */}
      <section className="sekcia sekcia--jemna odhal" id="dopyt" aria-labelledby="dopyt-nadpis">
        <div className="obal dopyt-mriezka">
          <div className="dopyt__uvod">
            <h2 id="dopyt-nadpis" className="sekcia__nadpis">
              Napíšte nám, na čom nováčikovia pohoria
            </h2>
            <p className="sekcia__uvod">Stačí jedna situácia. Zvyšok preberieme spolu.</p>
            <ol className="dopyt__kroky">
              <li>
                <span className="dopyt__krok-ikona" aria-hidden="true">
                  <FileText size={22} weight="regular" />
                </span>
                <span>Pripravíte dopyt a pošlete ho zo svojho e-mailu.</span>
              </li>
              <li>
                <span className="dopyt__krok-ikona" aria-hidden="true">
                  <ChatCircleText size={22} weight="regular" />
                </span>
                <span>Dohodneme hodinový rozhovor o vašich chybách a postupoch.</span>
              </li>
              <li>
                <span className="dopyt__krok-ikona" aria-hidden="true">
                  <CalendarCheck size={22} weight="regular" />
                </span>
                <span>Dostanete presnú ponuku s rozsahom, cenou a termínom.</span>
              </li>
            </ol>
          </div>
          <div className="bezel dopyt__ram">
            <div className="bezel__jadro dopyt__jadro">
              <Dopyt vybranyBalicek={balicek} onZmenaBalicka={setBalicek} />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
