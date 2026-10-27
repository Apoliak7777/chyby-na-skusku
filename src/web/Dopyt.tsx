import { useId, useRef, useState, type FormEvent } from 'react';
import { Copy, PaperPlaneTilt } from '@phosphor-icons/react';
import { balicky, formatEur, znacka } from '../config/znacka';
import { MAX_DLZKA_SITUACIE, mailtoOdkaz, validujDopyt, zostavDopyt, type ChybaPola, type DopytVstup } from './dopyt_text';
import { Sadzba } from './sadzba';

/**
 * Krátky formulár dopytu bez predstieraného backendu. Pripraví text, ktorý si návštevník
 * otvorí vo svojom e-mailovom programe alebo skopíruje. Nikdy nehlási „odoslané“.
 */
export function Dopyt() {
  const idPrefix = useId();
  const [vstup, setVstup] = useState<DopytVstup>({ situacia: '', firma: '', telefon: '', balicek: '' });
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
    const najdene = validujDopyt(vstup);
    setChyby(najdene);
    if (najdene.length > 0) {
      setPripraveny(null);
      const prve = najdene[0];
      if (prve) document.getElementById(`${idPrefix}-${prve.pole}`)?.focus();
      return;
    }
    const d = zostavDopyt(vstup);
    setPripraveny(d);
    setText(d.telo);
    setSkopirovane(null);
    window.setTimeout(() => textarea.current?.focus(), 0);
  };

  // Živý región sa pred novou správou vyprázdni, aby čítačka ohlásila aj opakované kopírovanie.
  const ohlas = (sprava: string) => {
    setSkopirovane(null);
    window.setTimeout(() => setSkopirovane(sprava), 60);
  };

  const skopiruj = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(pripraveny ? `${pripraveny.predmet}\n\n${text}` : text);
        ohlas(`Text je skopírovaný. Vložte ho do nového e-mailu na ${znacka.kontaktEmail}.`);
        return;
      }
    } catch {
      /* skúsime záložný spôsob */
    }
    textarea.current?.select();
    ohlas('Text je označený. Skopírujte ho klávesmi Ctrl + C.');
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
      inputMode?: 'tel' | 'text';
      maxDlzka?: number;
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
      maxLength: props.maxDlzka,
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
          <textarea {...spolocne} rows={3} onChange={(e) => nastav(nazov, e.target.value)} required={props.povinne} />
        ) : (
          <input
            {...spolocne}
            type={props.typ ?? 'text'}
            inputMode={props.inputMode}
            spellCheck={props.typ === 'tel' ? false : undefined}
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
    <Sadzba>
      <div className="dopyt">
        <form className="formular" onSubmit={priprav} noValidate>
          {pole('situacia', 'Kde sa u vás nový človek najčastejšie pomýli', {
            povinne: true,
            viacriadkove: true,
            placeholder: 'napr. potvrdí termín bez kontroly rezervácií',
            maxDlzka: MAX_DLZKA_SITUACIE,
          })}
          {pole('firma', 'Firma', { autoComplete: 'organization' })}
          {pole('telefon', 'Telefón, ak chcete radšej hovoriť', { typ: 'tel', inputMode: 'tel', autoComplete: 'tel' })}
          <div className="pole">
            <label htmlFor={`${idPrefix}-balicek`}>Čo vás zaujíma</label>
            <select id={`${idPrefix}-balicek`} name="balicek" value={vstup.balicek} onChange={(e) => nastav('balicek', e.target.value)}>
              <option value="">Ešte neviem, poraďte</option>
              {balicky.map((b) => (
                <option key={b.id} value={b.id}>
                  {`${b.nazov}: ${formatEur(b.cena)}`}
                </option>
              ))}
            </select>
          </div>
          <button type="submit" className="tlacidlo tlacidlo--hlavne">
            Pripraviť e-mail
          </button>
        </form>

        {pripraveny && (
          <section className="dopyt__vysledok" aria-labelledby={`${idPrefix}-vysledok`}>
            <h3 id={`${idPrefix}-vysledok`}>E-mail je pripravený. Odošlite ho zo svojej schránky.</h3>
            <p className="tlmeny male">Text si môžete upraviť. Zo stránky sa nič neodosiela.</p>
            <p>
              <strong>Predmet:</strong> {pripraveny.predmet}
            </p>
            <label htmlFor={`${idPrefix}-text`} className="visually-hidden">
              Text dopytu
            </label>
            <textarea id={`${idPrefix}-text`} name="text" ref={textarea} rows={11} value={text} onChange={(e) => setText(e.target.value)} />
            <div className="dopyt__akcie">
              {znacka.kontaktEmail && (
                <a className="tlacidlo tlacidlo--hlavne" href={mailtoOdkaz(znacka.kontaktEmail, pripraveny.predmet, text)}>
                  <PaperPlaneTilt size={18} weight="bold" aria-hidden="true" />
                  Otvoriť e-mail s dopytom
                </a>
              )}
              <button type="button" className="tlacidlo tlacidlo--druhotne" onClick={skopiruj}>
                <Copy size={18} weight="bold" aria-hidden="true" />
                Skopírovať text
              </button>
            </div>
            {/* Živý región je v DOM od zobrazenia výsledku, mení sa len jeho text. */}
            <p role="status" className="dopyt__stav">
              {skopirovane && <span className="hlasenie">{skopirovane}</span>}
            </p>
          </section>
        )}
      </div>
    </Sadzba>
  );
}
