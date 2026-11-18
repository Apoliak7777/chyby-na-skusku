import type { ReactNode } from 'react';
import { znacka } from '../config/znacka';
import { CESTY } from '../router';
import { Sadzba } from './sadzba';

/**
 * Údaje o podnikateľovi – zákonné minimum podľa § 4 zák. 22/2004 Z. z. a § 3a ObZ (Alex 18. 11. 2026: „zákonné minimum
 * áno, nič navyše“). Miesto podnikania a adresa bydliska sa ukážu, až keď ich Alex výslovne povolí v znacka.ts.
 */
export function UdajePodnikatela() {
  const email = znacka.kontaktEmail;
  const riadky: Array<[string, ReactNode]> =[['Obchodné meno', `${znacka.obchodneMeno} (značka Apoliak)`]];
  if (znacka.miestoPodnikania) riadky.push(['Miesto podnikania', znacka.miestoPodnikania]);
  if (znacka.adresaBydliska) riadky.push(['Adresa bydliska', znacka.adresaBydliska]);
  riadky.push(['IČO', znacka.ico]);
  if (znacka.zapis) riadky.push(['Zápis', znacka.zapis]);
  riadky.push(['DPH', 'nie som platiteľ DPH']);
  riadky.push([
    'Kontakt',
    <>
      {email && <a href={`mailto:${email}`}>{email}</a>}
      {email && znacka.telefon ? ', ' : ''}
      {znacka.telefon && <a href={`tel:${znacka.telefon.replace(/\s+/g, '')}`}>{znacka.telefon}</a>}
    </>,
  ]);
  riadky.push(['Orgán dozoru', znacka.organDozoru]);
  return (
    <Sadzba>
      <div className="obal obal--uzky pravne">
        <h1>Údaje o podnikateľovi</h1>
        <p className="tlmeny">Údaje podľa § 4 zákona č. 22/2004 Z. z. o elektronickom obchode a § 3a Obchodného zákonníka.</p>
        <table className="udaje">
          <tbody>
            {riadky.map(([nazov, hodnota]) => (
              <tr key={nazov}>
                <th scope="row">{nazov}</th>
                <td>{hodnota}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="bez-tlace">
          <a href={CESTY.web}>Späť na web</a>
        </p>
      </div>
    </Sadzba>
  );
}
