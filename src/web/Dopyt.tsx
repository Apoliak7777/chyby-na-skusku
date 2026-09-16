import { useId, useRef, useState, type FormEvent } from 'react';
import { ArrowRight, Copy, PaperPlaneTilt } from '@phosphor-icons/react';
import { balicky, znacka } from '../config/znacka';
import { mailtoOdkaz, validujDopyt, zostavDopyt, type ChybaPola, type DopytVstup } from './dopyt_text';

/**
 * Formulár dopytu bez predstieraného backendu. Pripraví text, ktorý si návštevník
 * skopíruje alebo otvorí vo svojom e-mailovom programe. Nikdy nehlási „odoslané“.
 */
export function Dopyt({ vybranyBalicek, onZmenaBalicka }: { vybranyBalicek: string; onZmenaBalicka: (id: string) => void }) {
  const idPrefix = useId();
  const [vstup, setVstup] = useState<DopytVstup>({ firma: '', email: '', pozicia: '', situacia: '', telefon: '' });
  const [chyby, setChyby] = useState<ChybaPola[]>([]);
  const [pripraveny, setPripraveny] = useState<{ predmet: string; telo: string } | null>(null);
  const [text, setText] = useState('');
  const [skopirovane, setSkopirovane] = useState<string | null>(null);
  const textarea = useRef<HTMLTextAreaElement>(null);

  const chybaPola = (pole: keyof DopytVstup) => chyby.find((c) => c.pole === pole)?.sprava;
  const nastav = (pole: keyof DopytVstup, hodnota: string) => {
    setVstup((v) => ({ ...v, [pole]: hodnota }));
    setChyby((ch) => ch.filter((c) => c.pole !== pole));
  };

  const priprav = (e: FormEvent) => {
    e.preventDefault();
    const udaje: DopytVstup = { ...vstup, balicek: vybranyBalicek };
    const najdene = validujDopyt(udaje);
    setChyby(najdene);
    if (najdene.length > 0) {
      setPripraveny(null);
      const prve = najdene[0];
      if (prve) document.getElementById(`${idPrefix}-${prve.pole}`)?.focus();
      return;
    }
    const d = zostavDopyt(udaje);
    setPripraveny(d);
    setText(d.telo);
    setSkopirovane(null);
    window.setTimeout(() => textarea.current?.focus(), 0);
  };

  const skopiruj = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(pripraveny ? `${pripraveny.predmet}\n\n${text}` : text);
        setSkopirovane('Text dopytu je skopírovaný. Vložte ho do nového e-mailu.');
        return;
      }
    } catch {
      /* skúsime záložný spôsob */
    }
    textarea.current?.select();
    setSkopirovane('Text je označený. Skopírujte ho klávesmi Ctrl + C.');
  };

  const pole = (
    nazov: keyof DopytVstup,
    popis: string,
    props: {
      typ?: string;
      povinne?: boolean;
      napoveda?: string;
      viacriadkove?: boolean;
      autoComplete?: string;
      placeholder?: string;
      inputMode?: 'email' | 'tel' | 'text';
    },
  ) => {
    const id = `${idPrefix}-${nazov}`;
    const chyba = chybaPola(nazov);
    const popisId = `${id}-napoveda`;
    const chybaId = `${id}-chyba`;
    const describedBy = [props.napoveda ? popisId : null, chyba ? chybaId : null].filter(Boolean).join(' ') || undefined;
    const spolocne = {
      id,
      name: nazov,
      value: vstup[nazov] ?? '',
      'aria-describedby': describedBy,
      'aria-invalid': chyba ? true : undefined,
      className: chyba ? 'pole--chybne' : undefined,
      autoComplete: props.autoComplete,
      placeholder: props.placeholder,
    };
    return (
      <div className="pole">
        <label htmlFor={id}>
          {popis}
          {props.povinne ? <span aria-hidden="true"> *</span> : <span className="tlmeny"> (nepovinné)</span>}
        </label>
        {props.napoveda && (
          <p id={popisId} className="pole__napoveda">
            {props.napoveda}
          </p>
        )}
        {props.viacriadkove ? (
          <textarea {...spolocne} rows={4} onChange={(e) => nastav(nazov, e.target.value)} required={props.povinne} />
        ) : (
          <input
            {...spolocne}
            type={props.typ ?? 'text'}
            inputMode={props.inputMode}
            spellCheck={props.typ === 'email' || props.typ === 'tel' ? false : undefined}
            onChange={(e) => nastav(nazov, e.target.value)}
            required={props.povinne}
          />
        )}
        {chyba && (
          <p id={chybaId} className="pole__chyba">
            {chyba}
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="dopyt">
      <form className="formular" onSubmit={priprav} noValidate aria-describedby={`${idPrefix}-info`}>
        <p id={`${idPrefix}-info`} className="tlmeny male">
          Polia s hviezdičkou sú povinné. Nežiadame prílohy ani osobné údaje vašich zamestnancov.
        </p>
        {pole('firma', 'Firma', { povinne: true, autoComplete: 'organization', placeholder: 'napr. Veľkoobchod Novák s. r. o.' })}
        {pole('email', 'Kontaktný e-mail', { povinne: true, typ: 'email', inputMode: 'email', autoComplete: 'email', placeholder: 'meno@firma.sk' })}
        {pole('telefon', 'Telefón', { typ: 'tel', inputMode: 'tel', autoComplete: 'tel', placeholder: '+421 …' })}
        {pole('pozicia', 'Pracovná pozícia na zaškolenie', {
          povinne: true,
          autoComplete: 'off',
          placeholder: 'napr. pracovník príjmu objednávok',
        })}
        {pole('situacia', 'Jedna situácia, ktorú chcete precvičiť', {
          povinne: true,
          viacriadkove: true,
          napoveda: 'Čo sa stalo, ako sa to odhalilo a čo mal pracovník urobiť správne. Stačia dve-tri vety.',
        })}
        <div className="pole">
          <label htmlFor={`${idPrefix}-balicek`}>Balíček, ktorý vás zaujíma</label>
          <select id={`${idPrefix}-balicek`} name="balicek" value={vybranyBalicek} onChange={(e) => onZmenaBalicka(e.target.value)}>
            <option value="">Ešte neviem, poraďte</option>
            {balicky.map((b) => (
              <option key={b.id} value={b.id}>
                {b.nazov}: {b.cena} € (úvodná cena)
              </option>
            ))}
          </select>
        </div>
        <button type="submit" className="tlacidlo tlacidlo--hlavne tlacidlo--velke">
          Pripraviť dopyt
          <span className="tlacidlo__ikona" aria-hidden="true">
            <ArrowRight size={18} weight="bold" />
          </span>
        </button>
      </form>

      {pripraveny && (
        <section className="dopyt__vysledok" aria-labelledby={`${idPrefix}-vysledok`}>
          <h3 id={`${idPrefix}-vysledok`}>Dopyt je pripravený. Odošlite ho zo svojho e-mailu.</h3>
          <p className="tlmeny male">Text si môžete pred odoslaním upraviť. Zo stránky sa nič neodosiela.</p>
          <p>
            <strong>Predmet:</strong> {pripraveny.predmet}
          </p>
          <label htmlFor={`${idPrefix}-text`} className="visually-hidden">
            Text dopytu
          </label>
          <textarea id={`${idPrefix}-text`} name="text" ref={textarea} rows={14} value={text} onChange={(e) => setText(e.target.value)} />
          <div className="suhrn__akcie">
            <button type="button" className="tlacidlo tlacidlo--hlavne" onClick={skopiruj}>
              <Copy size={18} weight="bold" aria-hidden="true" />
              Skopírovať dopyt
            </button>
            {znacka.kontaktEmail && (
              <a className="tlacidlo tlacidlo--druhotne" href={mailtoOdkaz(znacka.kontaktEmail, pripraveny.predmet, text)}>
                <PaperPlaneTilt size={18} weight="bold" aria-hidden="true" />
                Otvoriť e-mail s dopytom
              </a>
            )}
          </div>
          {skopirovane && (
            <p role="status" className="dopyt__stav">
              {skopirovane}
            </p>
          )}
          {znacka.kontaktEmail ? (
            <p>
              Adresa na zaslanie dopytu: <a href={`mailto:${znacka.kontaktEmail}`}>{znacka.kontaktEmail}</a>
            </p>
          ) : (
            <p className="upozornenie">Kontaktná adresa na zaslanie dopytu sa doplní pred publikovaním stránky. Text si zatiaľ skopírujte.</p>
          )}
        </section>
      )}
    </div>
  );
}
