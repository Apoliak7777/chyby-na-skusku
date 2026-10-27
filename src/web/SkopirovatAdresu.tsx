import { useState } from 'react';
import { Copy } from '@phosphor-icons/react';

/** Tlačidlo, ktoré skopíruje kontaktnú adresu. Pre počítače, kde mailto nič neotvorí (webmail). */
export function SkopirovatAdresu({ adresa }: { adresa: string }) {
  const [stav, setStav] = useState<string | null>(null);
  // Každé kopírovanie je nové hlásenie: nový kľúč znova spustí krátke vyskočenie (styles.css, .hlasenie).
  const [kolo, setKolo] = useState(0);

  const ohlas = (sprava: string) => {
    setStav(sprava);
    setKolo((k) => k + 1);
  };

  const skopiruj = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(adresa);
        ohlas(`Adresa ${adresa} je skopírovaná. Vložte ju do nového e-mailu.`);
        return;
      }
    } catch {
      /* nižšie ukážeme adresu na ručné skopírovanie */
    }
    ohlas(`Skopírujte si adresu ručne: ${adresa}`);
  };

  return (
    <>
      <button type="button" className="tlacidlo tlacidlo--druhotne tlacidlo--cely" onClick={skopiruj}>
        <Copy size={20} weight="bold" aria-hidden="true" />
        Skopírovať adresu
      </button>
      <p className="kontakt__stav male" role="status">
        {stav && (
          <span key={kolo} className="hlasenie">
            {stav}
          </span>
        )}
      </p>
    </>
  );
}
