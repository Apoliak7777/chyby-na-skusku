import type { Blok, Id, RozhodovaciUzol, Scenar, Trening, Uzol } from '../data/types';

/**
 * Automatická validácia scenárov: jedinečné identifikátory, existencia cieľových uzlov,
 * dosiahnuteľné konce, bez cyklov, konzistencia kontrolných bodov a existencia
 * bezchybnej cesty. Spúšťa sa v testoch aj cez `npm run validate`.
 */

export interface Nalez {
  uroven: 'chyba' | 'upozornenie';
  scenar: Id;
  kde?: string;
  sprava: string;
}

export function zhrnNalezy(nalezy: Nalez[]): { chyby: number; upozornenia: number } {
  return {
    chyby: nalezy.filter((n) => n.uroven === 'chyba').length,
    upozornenia: nalezy.filter((n) => n.uroven === 'upozornenie').length,
  };
}

function duplikaty(ids: Id[]): Id[] {
  const videne = new Set<Id>();
  const dup = new Set<Id>();
  for (const id of ids) {
    if (videne.has(id)) dup.add(id);
    videne.add(id);
  }
  return [...dup];
}

function odkazyNaPodklady(bloky: Blok[]): Id[] {
  return bloky.flatMap((b) => (b.typ === 'podklad' ? [b.podklad] : []));
}

function rozhodovacie(scenar: Scenar): RozhodovaciUzol[] {
  return scenar.uzly.filter((u): u is RozhodovaciUzol => u.typ === 'rozhodnutie');
}

export function validujScenar(scenar: Scenar): Nalez[] {
  const nalezy: Nalez[] = [];
  const chyba = (sprava: string, kde?: string) => nalezy.push(kde ? { uroven: 'chyba', scenar: scenar.id, kde, sprava } : { uroven: 'chyba', scenar: scenar.id, sprava });
  const upozornenie = (sprava: string, kde?: string) =>
    nalezy.push(kde ? { uroven: 'upozornenie', scenar: scenar.id, kde, sprava } : { uroven: 'upozornenie', scenar: scenar.id, sprava });

  /* 1. Základné texty */
  if (!scenar.nazov.trim()) chyba('Scenár nemá názov.');
  if (!scenar.strucnyProblem.trim()) upozornenie('Scenár nemá stručný opis problému (potrebný pre web a prehľad).');
  if (scenar.zadanie.length === 0) upozornenie('Scenár nemá zadanie (úvod pred prvým rozhodnutím).');
  if (scenar.kontrolneBody.length < 2 || scenar.kontrolneBody.length > 4) {
    upozornenie(`Scenár má ${scenar.kontrolneBody.length} kontrolných bodov; odporúčané sú 2 až 4.`);
  }

  /* 2. Jedinečné identifikátory */
  for (const d of duplikaty(scenar.uzly.map((u) => u.id))) chyba(`Duplicitné ID uzla „${d}“.`);
  for (const d of duplikaty(scenar.kontrolneBody.map((k) => k.id))) chyba(`Duplicitné ID kontrolného bodu „${d}“.`);
  for (const d of duplikaty(scenar.podklady.map((p) => p.id))) chyba(`Duplicitné ID podkladu „${d}“.`);
  for (const d of duplikaty(rozhodovacie(scenar).flatMap((u) => u.moznosti.map((m) => m.id)))) {
    chyba(`Duplicitné ID možnosti „${d}“.`);
  }

  const uzly = new Map<Id, Uzol>(scenar.uzly.map((u) => [u.id, u]));
  const kbIds = new Set(scenar.kontrolneBody.map((k) => k.id));
  const podkladIds = new Set(scenar.podklady.map((p) => p.id));

  /* 3. Vstupný uzol */
  const vstup = uzly.get(scenar.vstupnyUzol);
  if (!vstup) chyba(`Vstupný uzol „${scenar.vstupnyUzol}“ neexistuje.`);
  else if (vstup.typ !== 'rozhodnutie') upozornenie('Vstupný uzol je záverečný – scenár nemá žiadne rozhodnutie.');

  /* 4. Uzly, možnosti, väzby */
  for (const uzol of scenar.uzly) {
    const kde = `uzol ${uzol.id}`;
    for (const p of odkazyNaPodklady(uzol.pribeh)) {
      if (!podkladIds.has(p)) chyba(`Príbeh odkazuje na neexistujúci podklad „${p}“.`, kde);
    }
    if (uzol.typ === 'zaver') {
      if (uzol.vysvetlenie.length === 0) upozornenie('Záverečný uzol nemá vysvetlenie rozhodujúcich krokov.', kde);
      continue;
    }
    for (const p of uzol.podklady ?? []) {
      if (!podkladIds.has(p)) chyba(`Uzol odkazuje na neexistujúci podklad „${p}“.`, kde);
    }
    if (!uzol.uloha.trim()) chyba('Rozhodovací uzol nemá úlohu (otázku).', kde);
    if (uzol.moznosti.length === 0) chyba('Rozhodovací uzol nemá žiadnu možnosť.', kde);
    if (uzol.moznosti.length > 4) chyba(`Rozhodovací uzol má ${uzol.moznosti.length} možností; povolené sú najviac 4.`, kde);
    if (uzol.moznosti.length === 1) upozornenie('Rozhodovací uzol má len jednu možnosť – používateľ nič nerozhoduje.', kde);

    for (const m of uzol.moznosti) {
      const kdeM = `${kde}, možnosť ${m.id}`;
      if (!m.text.trim()) chyba('Možnosť nemá text.', kdeM);
      if (!uzly.has(m.dalsi)) chyba(`Cieľový uzol „${m.dalsi}“ neexistuje.`, kdeM);
      if (m.dalsi === uzol.id) chyba('Možnosť vedie späť do toho istého uzla.', kdeM);
      for (const kb of Object.keys(m.ucinky ?? {})) {
        if (!kbIds.has(kb)) chyba(`Účinok odkazuje na neexistujúci kontrolný bod „${kb}“.`, kdeM);
      }
      if (m.naklad !== undefined && (!Number.isFinite(m.naklad) || m.naklad < 0)) {
        chyba(`Náklad „${m.naklad}“ nie je nezáporné číslo.`, kdeM);
      }
      if (!uzol.vstup && (m.hodnoty || m.ostatneHodnoty)) {
        chyba('Možnosť má priradené hodnoty, ale uzol nemá číselný vstup.', kdeM);
      }
    }

    if (uzol.vstup) {
      const { min, max } = uzol.vstup;
      if (!(min <= max)) chyba(`Číselný vstup má min (${min}) väčšie než max (${max}).`, kde);
      const zachytne = uzol.moznosti.filter((m) => m.ostatneHodnoty);
      if (zachytne.length !== 1) chyba(`Uzol s číselným vstupom musí mať presne jednu záchytnú možnosť (ostatneHodnoty), má ${zachytne.length}.`, kde);
      const vsetkyHodnoty: number[] = [];
      for (const m of uzol.moznosti) {
        if (!m.hodnoty && !m.ostatneHodnoty) chyba('Možnosť pri číselnom vstupe nemá hodnoty ani ostatneHodnoty.', `${kde}, možnosť ${m.id}`);
        for (const h of m.hodnoty ?? []) {
          if (h < min || h > max) chyba(`Hodnota ${h} je mimo rozsahu vstupu ${min}–${max}.`, `${kde}, možnosť ${m.id}`);
          vsetkyHodnoty.push(h);
        }
      }
      for (const d of duplikaty(vsetkyHodnoty.map(String))) chyba(`Hodnota ${d} je priradená viacerým možnostiam.`, kde);
    }
  }

  /* Ak chýbajú väzby, graf nemá zmysel ďalej prechádzať. */
  if (nalezy.some((n) => n.uroven === 'chyba')) return nalezy;

  /* 5. Dosiahnuteľnosť z vstupu */
  const dosiahnutelne = new Set<Id>();
  const front: Id[] = [scenar.vstupnyUzol];
  while (front.length > 0) {
    const id = front.pop()!;
    if (dosiahnutelne.has(id)) continue;
    dosiahnutelne.add(id);
    const u = uzly.get(id)!;
    if (u.typ === 'rozhodnutie') for (const m of u.moznosti) front.push(m.dalsi);
  }
  for (const u of scenar.uzly) {
    if (!dosiahnutelne.has(u.id)) upozornenie('Uzol nie je dosiahnuteľný zo vstupného uzla.', `uzol ${u.id}`);
  }

  /* 6. Cykly (DFS s farbami) */
  const farba = new Map<Id, 0 | 1 | 2>();
  const cyklus: Id[] = [];
  const dfs = (id: Id, cesta: Id[]): boolean => {
    farba.set(id, 1);
    const u = uzly.get(id)!;
    if (u.typ === 'rozhodnutie') {
      for (const m of u.moznosti) {
        const f = farba.get(m.dalsi) ?? 0;
        if (f === 1) {
          cyklus.push(...cesta.slice(cesta.indexOf(m.dalsi)), m.dalsi);
          return true;
        }
        if (f === 0 && dfs(m.dalsi, [...cesta, m.dalsi])) return true;
      }
    }
    farba.set(id, 2);
    return false;
  };
  for (const u of scenar.uzly) {
    if ((farba.get(u.id) ?? 0) === 0 && dfs(u.id, [u.id])) {
      chyba(`Scenár obsahuje cyklus: ${cyklus.join(' → ')}. Opakovanie je funkcia rozhrania, nie vetva príbehu.`);
      break;
    }
  }
  if (cyklus.length > 0) return nalezy;

  /* 7. Z každého dosiahnuteľného uzla musí byť dosiahnuteľný koniec */
  const vedieKuKoncu = new Map<Id, boolean>();
  const koniecZ = (id: Id): boolean => {
    const znamy = vedieKuKoncu.get(id);
    if (znamy !== undefined) return znamy;
    const u = uzly.get(id)!;
    const vysledok = u.typ === 'zaver' ? true : u.moznosti.some((m) => koniecZ(m.dalsi));
    vedieKuKoncu.set(id, vysledok);
    return vysledok;
  };
  for (const id of dosiahnutelne) {
    if (!koniecZ(id)) chyba('Z uzla sa nedá dostať k žiadnemu záveru.', `uzol ${id}`);
  }
  const konceSpravne = scenar.uzly.filter((u) => u.typ === 'zaver' && u.vysledok === 'spravne');
  if (konceSpravne.length === 0) chyba('Scenár nemá záver s výsledkom „spravne“.');

  /* 8. Kontrolné body: každý musí mať aspoň jednu splňujúcu možnosť */
  const splnaju = new Map<Id, number>();
  const nesplnaju = new Map<Id, number>();
  for (const u of rozhodovacie(scenar)) {
    for (const m of u.moznosti) {
      for (const [kb, ucinok] of Object.entries(m.ucinky ?? {})) {
        const mapa = ucinok === 'splnene' ? splnaju : nesplnaju;
        mapa.set(kb, (mapa.get(kb) ?? 0) + 1);
      }
    }
  }
  for (const kb of scenar.kontrolneBody) {
    if (!splnaju.get(kb.id)) chyba('Kontrolný bod nemá žiadnu možnosť, ktorá by ho splnila.', `kontrolný bod ${kb.id}`);
    if (!nesplnaju.get(kb.id)) upozornenie('Kontrolný bod nemá žiadnu možnosť, ktorá by ho nesplnila – nič sa ním nerozlišuje.', `kontrolný bod ${kb.id}`);
  }

  /* 9. Bezchybná cesta a náklady na správnom závere (prechod všetkých ciest – graf je DAG) */
  let bezchybna = false;
  let spravnyZaverSNakladom: number | undefined;
  const prejdi = (id: Id, splnene: Set<Id>, niekedyNesplnene: Set<Id>, naklad: number) => {
    const u = uzly.get(id)!;
    if (u.typ === 'zaver') {
      if (u.vysledok === 'spravne') {
        if (naklad > 0 && spravnyZaverSNakladom === undefined) spravnyZaverSNakladom = naklad;
        const vsetky = scenar.kontrolneBody.every((kb) => splnene.has(kb.id) && !niekedyNesplnene.has(kb.id));
        if (vsetky) bezchybna = true;
      }
      return;
    }
    for (const m of u.moznosti) {
      const s = new Set(splnene);
      const n = new Set(niekedyNesplnene);
      for (const [kb, ucinok] of Object.entries(m.ucinky ?? {})) {
        if (ucinok === 'splnene') s.add(kb);
        else {
          n.add(kb);
          s.delete(kb);
        }
      }
      prejdi(m.dalsi, s, n, naklad + (m.naklad ?? 0));
    }
  };
  prejdi(scenar.vstupnyUzol, new Set(), new Set(), 0);
  if (!bezchybna) chyba('Neexistuje cesta, na ktorej sú všetky kontrolné body splnené na prvý pokus a končí správnym záverom.');
  if (spravnyZaverSNakladom !== undefined) {
    upozornenie(`Správny záver je dosiahnuteľný cestou s modelovým nákladom ${spravnyZaverSNakladom} €.`);
  }

  return nalezy;
}

export function validujTrening(trening: Trening): Nalez[] {
  const nalezy: Nalez[] = [];
  if (trening.scenare.length === 0) {
    nalezy.push({ uroven: 'chyba', scenar: '(tréning)', sprava: 'Tréning nemá žiadny scenár.' });
  }
  for (const d of duplikaty(trening.scenare.map((s) => s.id))) {
    nalezy.push({ uroven: 'chyba', scenar: d, sprava: `Duplicitné ID scenára „${d}“.` });
  }
  for (const d of duplikaty(trening.scenare.flatMap((s) => s.uzly.map((u) => u.id)))) {
    nalezy.push({ uroven: 'upozornenie', scenar: '(tréning)', sprava: `ID uzla „${d}“ sa opakuje vo viacerých scenároch.` });
  }
  if (!trening.znacka.nazovFirmy.trim()) {
    nalezy.push({ uroven: 'chyba', scenar: '(tréning)', sprava: 'Tréning nemá názov firmy v značke.' });
  }
  for (const s of trening.scenare) nalezy.push(...validujScenar(s));
  return nalezy;
}

/** Pomocník pre výpis: text nálezu na jeden riadok. */
export function formatujNalez(n: Nalez): string {
  const znak = n.uroven === 'chyba' ? 'CHYBA' : 'upozornenie';
  return `[${znak}] ${n.scenar}${n.kde ? ` (${n.kde})` : ''}: ${n.sprava}`;
}
