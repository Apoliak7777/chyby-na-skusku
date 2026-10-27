import type { Scenar } from '../types';

/**
 * Scenár 3: Zmena adresy na poslednú chvíľu
 * Precvičuje dokončenie zmeny objednávky vrátane skladu a prepravných údajov.
 * Uznáva viac správnych poradí (overenie ↔ zastavenie expedície).
 */
export const NAKLAD_OPAKOVANEJ_DOPRAVY = 65;

export const zmenaAdresy: Scenar = {
  id: 'zmena-adresy',
  verzia: '1.1',
  nazov: 'Zmena adresy na poslednú chvíľu',
  strucnyProblem: 'Zákazníčka mení dodaciu adresu. Zásielka je už vychystaná a odvoz je o 15:00. Ako zmenu vybavíte?',
  pozicia: 'Pracovník príjmu objednávok',
  cvici: 'dokončenie zmeny objednávky vrátane skladu a prepravných údajov.',
  zadanie: ['Štvrtok 13:10. Objednávka D-1042 je vychystaná na rampe a dopravca ju preberie o 15:00. Práve prišiel e-mail so žiadosťou o zmenu dodacej adresy.'],
  typickaChyba: 's3-start-hlavicka',
  podklady: [
    {
      id: 's3-email',
      nazov: 'E-mail zákazníka',
      druh: 'email',
      bloky: [
        {
          typ: 'email',
          od: 'Mgr. Jana Kováčová, nákup, Montáže Ďurica s. r. o.',
          komu: 'príjem objednávok, DEMO DISTRIBÚCIA',
          predmet: 'Zmena dodacej adresy, objednávka D-1042',
          datum: 'štvrtok 13:10',
          text: [
            'Dobrý deň,',
            'prosím o zmenu dodacej adresy pri objednávke D-1042 na: Sklad B, Logistická 22. Fakturačná adresa zostáva bez zmeny.',
            'Ďakujem za potvrdenie.',
            'Jana Kováčová, nákup',
          ],
        },
      ],
    },
    {
      id: 's3-objednavka',
      nazov: 'Objednávka D-1042',
      druh: 'objednavka',
      bloky: [
        {
          typ: 'zaznam',
          nadpis: 'Hlavička objednávky',
          polia: [
            { nazov: 'Číslo objednávky', hodnota: 'D-1042' },
            { nazov: 'Zákazník', hodnota: 'Montáže Ďurica s. r. o.' },
            { nazov: 'Kontaktná osoba oprávnená na zmeny', hodnota: 'Mgr. Jana Kováčová (nákup)', zvyraznit: true },
            { nazov: 'Dodacia adresa', hodnota: 'Sklad A, Priemyselná 10', zvyraznit: true },
            { nazov: 'Fakturačná adresa', hodnota: 'Montáže Ďurica s. r. o., Hlavná 5, Nitra' },
            { nazov: 'Tovar', hodnota: '4 palety spojovacieho materiálu' },
            { nazov: 'Stav', hodnota: 'vychystaná', zvyraznit: true },
            { nazov: 'Prepravný štítok', hodnota: 'vytlačený 12:20 (Sklad A)', zvyraznit: true },
            { nazov: 'Odvoz dopravcom', hodnota: 'dnes 15:00' },
          ],
        },
      ],
    },
    {
      id: 's3-sklad',
      nazov: 'Stav expedície',
      druh: 'sklad',
      bloky: [
        {
          typ: 'text',
          text: [
            'D-1042 je vychystaná na rampe 2. Štítok bol vytlačený o 12:20 na adresu Sklad A. Dopravca preberá zásielky o 15:00.',
            'Sklad expeduje podľa vytlačeného štítku. Zmena adresy v systéme štítok automaticky nepretlačí. Sklad musí dostať pokyn a starý štítok vymeniť.',
          ],
        },
      ],
    },
    {
      id: 's3-pravidla',
      nazov: 'Pravidlá firmy',
      druh: 'pravidla',
      bloky: [
        {
          typ: 'zoznam',
          nadpis: 'Postup DEMO DISTRIBÚCIE pri zmene objednávky po vychystaní',
          polozky: [
            'Overiť číslo objednávky a to, že zmenu žiada oprávnená kontaktná osoba uvedená v objednávke.',
            'Zastaviť expedíciu (telefonicky alebo cez skladový systém) skôr, ako zásielka odíde.',
            'Opraviť dodaciu adresu v objednávke. Fakturačná adresa sa mení len na výslovnú žiadosť.',
            'Vyžiadať od skladu potvrdenie, že starý štítok bol vymenený za nový.',
            'Zákazníkovi potvrdiť zmenu až po potvrdení skladu.',
            'Poradie krokov 1 a 2 môže byť opačné, ak hrozí, že zásielka odíde.',
          ],
        },
        {
          typ: 'poznamka',
          nadpis: 'Následok',
          text: ['Ak zásielka odíde na pôvodnú adresu, presmerovanie a opakovaná doprava stoja 65 € (modelová suma).'],
        },
      ],
    },
  ],
  kontrolneBody: [
    {
      id: 's3-kb-overenie',
      nazov: 'Overil číslo objednávky a oprávnenú kontaktnú osobu',
      vysvetlenie: 'Zmenu môže žiadať len osoba uvedená v objednávke. Overenie chráni pred zmenou od nesprávnej osoby.',
      zdrojPravidla: 'Pravidlá firmy, bod 1',
    },
    {
      id: 's3-kb-expedicia',
      nazov: 'Zastavil expedíciu a zabezpečil výmenu štítku s potvrdením skladu',
      vysvetlenie: 'Sklad expeduje podľa štítku. Kým sa štítok nevymení, zmena v systéme nič nemení. Zastavená expedícia na to dáva čas.',
      zdrojPravidla: 'Pravidlá firmy, body 2 a 4; stav expedície',
    },
    {
      id: 's3-kb-fakturacna',
      nazov: 'Zmenil len dodaciu adresu, fakturačnú ponechal',
      vysvetlenie: 'Pani Kováčová výslovne píše, že fakturačná adresa zostáva. Zmenená by pokazila faktúru.',
      zdrojPravidla: 'Pravidlá firmy, bod 3; e-mail zákazníka',
    },
    {
      id: 's3-kb-potvrdenie',
      nazov: 'Potvrdil zákazníkovi až po dokončení zmeny',
      vysvetlenie: 'Potvrdenie, ktoré ešte neplatí, je horšie ako žiadne. Zákazník sa naň spoľahne.',
      zdrojPravidla: 'Pravidlá firmy, bod 5',
    },
  ],
  vstupnyUzol: 's3-start',
  uzly: [
    {
      id: 's3-start',
      typ: 'rozhodnutie',
      nadpis: 'Žiadosť o zmenu adresy',
      pribeh: [
        { typ: 'podklad', podklad: 's3-email' },
        {
          typ: 'text',
          text: ['V systéme vidíte: D-1042 je vychystaná, štítok vytlačený na Sklad A, odvoz o 15:00.'],
        },
      ],
      uloha: 'Je 13:12. Čo urobíte ako prvé?',
      podklady: ['s3-email', 's3-objednavka'],
      moznosti: [
        {
          id: 's3-start-overit',
          text: 'Overiť objednávku D-1042 a kontaktnú osobu.',
          dalsi: 's3-po-overeni',
          nasledok: 'Objednávku a oprávnenie ste overili.',
          ucinky: { 's3-kb-overenie': 'splnene' },
        },
        {
          id: 's3-start-zastavit',
          text: 'Zavolať na sklad, nech D-1042 zatiaľ nepúšťajú.',
          dalsi: 's3-zastavene-prv',
          nasledok: 'Expedícia stojí, zásielka neodíde.',
        },
        {
          id: 's3-start-predcasne',
          text: 'Odpísať pani Kováčovej „vybavené“ a zmenu zadať po obede.',
          dalsi: 's3-predcasne',
          nasledok: 'Zákazníčka dostala potvrdenie, ktoré ešte neplatí.',
          ucinky: { 's3-kb-potvrdenie': 'nesplnene' },
        },
        {
          id: 's3-start-hlavicka',
          text: 'Prepísať dodaciu adresu v objednávke a odpísať pani Kováčovej, že je zmenená.',
          dalsi: 's3-len-hlavicka',
          nasledok: 'Zmenili ste hlavičku, štítok ostal starý.',
          ucinky: { 's3-kb-fakturacna': 'splnene', 's3-kb-expedicia': 'nesplnene', 's3-kb-potvrdenie': 'nesplnene' },
        },
      ],
    },
    {
      id: 's3-po-overeni',
      typ: 'rozhodnutie',
      nadpis: 'Objednávka overená',
      pribeh: [
        {
          typ: 'text',
          text: [
            'Objednávka D-1042 patrí Montážam Ďurica s. r. o. Mgr. Jana Kováčová je v objednávke uvedená ako kontaktná osoba oprávnená na zmeny. Stav: vychystaná, štítok vytlačený na Sklad A, odvoz o 15:00.',
          ],
        },
        { typ: 'podklad', podklad: 's3-objednavka' },
      ],
      uloha: 'Ako budete pokračovať?',
      podklady: ['s3-objednavka', 's3-sklad', 's3-pravidla'],
      moznosti: [
        {
          id: 's3-overene-zastavit',
          text: 'Zavolať na sklad a zastaviť expedíciu D-1042.',
          dalsi: 's3-uprava-adresy',
          nasledok: 'Expedícia stojí.',
        },
        {
          id: 's3-overene-prepisat',
          text: 'Prepísať dodaciu adresu v objednávke.',
          dalsi: 's3-upravene-bez-zastavenia',
          nasledok: 'Adresa v systéme je nová, sklad o tom nevie.',
          ucinky: { 's3-kb-expedicia': 'nesplnene' },
        },
      ],
    },
    {
      id: 's3-zastavene-prv',
      typ: 'rozhodnutie',
      nadpis: 'Expedícia stojí',
      pribeh: [
        {
          typ: 'text',
          text: ['Sklad: „Dobre, D-1042 ostáva na rampe, dopravcovi ju nedáme. Čo s ňou?“'],
        },
      ],
      uloha: 'Expedícia stojí. Čo urobíte teraz?',
      podklady: ['s3-objednavka', 's3-pravidla'],
      moznosti: [
        {
          id: 's3-zastavene-overit',
          text: 'Overiť objednávku D-1042 a kontaktnú osobu, potom upraviť adresu.',
          dalsi: 's3-uprava-adresy',
          nasledok: 'Objednávku a oprávnenie ste overili.',
          ucinky: { 's3-kb-overenie': 'splnene' },
        },
        {
          id: 's3-zastavene-diktovat',
          text: 'Nadiktovať skladu novú adresu z e-mailu.',
          dalsi: 's3-bez-overenia',
          nasledok: 'Zmenu ste zadali bez overenia.',
          ucinky: { 's3-kb-overenie': 'nesplnene' },
        },
      ],
    },
    {
      id: 's3-bez-overenia',
      typ: 'rozhodnutie',
      spatnaVazba: true,
      nadpis: 'Sklad sa pýta na overenie',
      pribeh: [
        {
          typ: 'text',
          text: [
            'Sklad: „Je to overené? Minulý mesiac nám niekto z inej firmy poslal zmenu adresy omylom a išlo to na zlé miesto.“',
            'V objednávke D-1042 je pani Kováčová uvedená ako oprávnená osoba. Tentoraz to sedí, ale bez overenia ste to nevedeli.',
          ],
        },
      ],
      uloha: 'Ako pokračujete?',
      podklady: ['s3-objednavka', 's3-pravidla'],
      moznosti: [
        {
          id: 's3-bezoverenia-overit',
          text: 'Overiť objednávku a kontaktnú osobu, potom zadať zmenu.',
          dalsi: 's3-uprava-adresy',
          nasledok: 'Overenie ste doplnili.',
          ucinky: { 's3-kb-overenie': 'splnene' },
        },
        {
          id: 's3-bezoverenia-pokracovat',
          text: 'Pokračovať v zmene adresy.',
          dalsi: 's3-uprava-adresy',
          nasledok: 'Pokračovali ste bez overenia.',
        },
      ],
    },
    {
      id: 's3-upravene-bez-zastavenia',
      typ: 'rozhodnutie',
      spatnaVazba: true,
      nadpis: 'Sklad volá pred odvozom',
      pribeh: [
        {
          typ: 'text',
          text: [
            'Adresa v objednávke je zmenená. O 14:35 volá sklad: „D-1042 má štítok na Sklad A a dopravca príde o 25 minút. V systéme vidím inú adresu, ale štítok je vytlačený. Čo platí?“',
          ],
        },
      ],
      uloha: 'Čo urobíte?',
      podklady: ['s3-sklad', 's3-pravidla'],
      moznosti: [
        {
          id: 's3-bezzastavenia-zastavit',
          text: 'Požiadať sklad, nech zásielku zadrží a vymení štítok.',
          dalsi: 's3-potvrdenie-skladu',
          nasledok: 'Sklad zásielku zadržal a mení štítok.',
          ucinky: { 's3-kb-expedicia': 'splnene' },
        },
        {
          id: 's3-bezzastavenia-poslat',
          text: 'Povedať skladu, nech zásielku odovzdá dopravcovi.',
          dalsi: 's3-koniec-odislo',
          nasledok: 'Zásielka odišla so starým štítkom.',
          naklad: NAKLAD_OPAKOVANEJ_DOPRAVY,
        },
      ],
    },
    {
      id: 's3-uprava-adresy',
      typ: 'rozhodnutie',
      nadpis: 'Úprava objednávky a štítok',
      pribeh: [
        {
          typ: 'text',
          text: [
            'Expedícia D-1042 stojí. Otvorili ste editáciu objednávky. Na zásielke na rampe je stále štítok na Sklad A. Sklad expeduje podľa štítku, nie podľa hlavičky.',
          ],
        },
        { typ: 'podklad', podklad: 's3-objednavka' },
      ],
      uloha: 'Ktoré údaje upravíte a čo so štítkom?',
      podklady: ['s3-email', 's3-objednavka', 's3-sklad'],
      moznosti: [
        {
          id: 's3-uprava-len-dodacia',
          text: 'Zmeniť dodaciu adresu a požiadať sklad o výmenu štítku.',
          dalsi: 's3-potvrdenie-skladu',
          nasledok: 'Dodacia adresa je nová, fakturačná pôvodná, sklad mení štítok.',
          ucinky: { 's3-kb-fakturacna': 'splnene', 's3-kb-expedicia': 'splnene' },
        },
        {
          id: 's3-uprava-obe',
          text: 'Zmeniť dodaciu aj fakturačnú adresu a požiadať sklad o výmenu štítku.',
          dalsi: 's3-fakturacna-zmenena',
          nasledok: 'Zmenili ste aj fakturačnú adresu.',
          ucinky: { 's3-kb-fakturacna': 'nesplnene', 's3-kb-expedicia': 'splnene' },
        },
        {
          id: 's3-uprava-bez-stitku',
          text: 'Zmeniť dodaciu adresu a odpísať pani Kováčovej, že je hotovo.',
          dalsi: 's3-predcasne-stitok',
          nasledok: 'Zákazníčka má potvrdenie, sklad nemá pokyn.',
          ucinky: { 's3-kb-fakturacna': 'splnene', 's3-kb-expedicia': 'nesplnene', 's3-kb-potvrdenie': 'nesplnene' },
        },
      ],
    },
    {
      id: 's3-fakturacna-zmenena',
      typ: 'rozhodnutie',
      spatnaVazba: true,
      nadpis: 'Fakturačná adresa sa nemala meniť',
      pribeh: [
        {
          typ: 'text',
          text: [
            'Pani Kováčová v e-maile výslovne píše, že fakturačná adresa zostáva bez zmeny. Faktúra so zmenenou fakturačnou adresou by neprešla ich účtovníctvom a museli by ste ju opraviť. Sklad medzitým mení štítok.',
          ],
        },
      ],
      uloha: 'Čo urobíte?',
      podklady: ['s3-email', 's3-objednavka'],
      moznosti: [
        {
          id: 's3-fakturacna-vratit',
          text: 'Vrátiť fakturačnú adresu na pôvodnú.',
          dalsi: 's3-potvrdenie-skladu',
          nasledok: 'Fakturačná adresa je späť pôvodná.',
          ucinky: { 's3-kb-fakturacna': 'splnene' },
        },
        {
          id: 's3-fakturacna-nechat',
          text: 'Nechať obe adresy tak, ako sú.',
          dalsi: 's3-potvrdenie-skladu',
          nasledok: 'Faktúra pôjde s nesprávnou adresou.',
        },
      ],
    },
    {
      id: 's3-predcasne-stitok',
      typ: 'rozhodnutie',
      spatnaVazba: true,
      nadpis: 'Sklad o zmene nevie',
      pribeh: [
        {
          typ: 'text',
          text: [
            'O 14:50 volá sklad: „D-1042 stojí na rampe so štítkom na Sklad A a dopravca príde o desať minút. Pokyn na nový štítok sme nedostali. Pustiť ju?“ Pani Kováčová má od vás potvrdenie, že zmena je hotová.',
          ],
        },
      ],
      uloha: 'Čo urobíte?',
      podklady: ['s3-sklad', 's3-pravidla'],
      moznosti: [
        {
          id: 's3-predcasnestitok-vymenit',
          text: 'Požiadať sklad, nech zásielku zadrží a vymení štítok.',
          dalsi: 's3-potvrdenie-skladu',
          nasledok: 'Sklad mení štítok na poslednú chvíľu.',
          ucinky: { 's3-kb-expedicia': 'splnene' },
        },
        {
          id: 's3-predcasnestitok-nechat',
          text: 'Povedať skladu, nech zásielku pustí.',
          dalsi: 's3-koniec-odislo',
          nasledok: 'Zásielka odišla so starým štítkom.',
          naklad: NAKLAD_OPAKOVANEJ_DOPRAVY,
        },
      ],
    },
    {
      id: 's3-potvrdenie-skladu',
      typ: 'rozhodnutie',
      nadpis: 'Potvrdenie skladu',
      pribeh: [
        {
          typ: 'text',
          text: ['Sklad potvrdzuje: „Štítok vymenený. D-1042 ide na Sklad B, Logistická 22, odvoz o 15:00.“'],
        },
      ],
      uloha: 'Zmena je dokončená. Čo teraz?',
      podklady: ['s3-email', 's3-pravidla'],
      moznosti: [
        {
          id: 's3-potvrdenie-poslat',
          text: 'Odpovedať pani Kováčovej, že zmena je dokončená.',
          dalsi: 's3-koniec-spravne',
          nasledok: 'Pani Kováčová má potvrdenie, ktoré platí.',
          ucinky: { 's3-kb-potvrdenie': 'splnene' },
        },
        {
          id: 's3-potvrdenie-neposlat',
          text: 'Pokračovať ďalšou objednávkou.',
          dalsi: 's3-koniec-bez-potvrdenia',
          nasledok: 'Pani Kováčová o dokončení nevie.',
          ucinky: { 's3-kb-potvrdenie': 'nesplnene' },
        },
      ],
    },
    {
      id: 's3-predcasne',
      typ: 'rozhodnutie',
      spatnaVazba: true,
      nadpis: 'Potvrdené, ale nezmenené',
      pribeh: [
        {
          typ: 'text',
          text: [
            'Odpísali ste „vybavené“. Je 13:15. D-1042 stále stojí vychystaná so štítkom na Sklad A, odvoz o 15:00. Zmena zatiaľ neexistuje nikde okrem vášho e-mailu.',
          ],
        },
      ],
      uloha: 'Čo urobíte?',
      podklady: ['s3-objednavka', 's3-pravidla'],
      moznosti: [
        {
          id: 's3-predcasne-dokoncit',
          text: 'Hneď zastaviť expedíciu, overiť objednávku a zmenu dokončiť.',
          dalsi: 's3-uprava-adresy',
          nasledok: 'Expedícia stojí, objednávka je overená.',
          ucinky: { 's3-kb-overenie': 'splnene' },
        },
        {
          id: 's3-predcasne-po-obede',
          text: 'Pokračovať v inej práci, zmenu zadať po obede.',
          dalsi: 's3-koniec-odislo',
          nasledok: 'Zásielka odišla so starým štítkom.',
          naklad: NAKLAD_OPAKOVANEJ_DOPRAVY,
        },
      ],
    },
    {
      id: 's3-len-hlavicka',
      typ: 'rozhodnutie',
      spatnaVazba: true,
      nadpis: 'Hlavička nie je štítok',
      pribeh: [
        {
          typ: 'text',
          text: [
            'Dodacia adresa v hlavičke objednávky je zmenená a pani Kováčová má vaše potvrdenie. Na rampe však leží D-1042 so štítkom na Sklad A a sklad expeduje podľa štítku, nie podľa hlavičky.',
          ],
        },
        { typ: 'podklad', podklad: 's3-sklad' },
      ],
      uloha: 'Čo urobíte?',
      podklady: ['s3-sklad', 's3-pravidla'],
      moznosti: [
        {
          id: 's3-hlavicka-zastavit',
          text: 'Zavolať na sklad, nech zásielku zadrží a vymení štítok.',
          dalsi: 's3-potvrdenie-skladu',
          nasledok: 'Sklad zásielku zadržal a mení štítok.',
          ucinky: { 's3-kb-expedicia': 'splnene' },
        },
        {
          id: 's3-hlavicka-nechat',
          text: 'Nechať to tak a pokračovať ďalšou objednávkou.',
          dalsi: 's3-koniec-odislo',
          nasledok: 'Zásielka odišla so starým štítkom.',
          naklad: NAKLAD_OPAKOVANEJ_DOPRAVY,
        },
      ],
    },
    {
      id: 's3-koniec-spravne',
      typ: 'zaver',
      nadpis: 'Zmena dokončená',
      vysledok: 'spravne',
      pribeh: [
        {
          typ: 'text',
          text: [
            'O 15:00 dopravca prevzal D-1042 so štítkom Sklad B, Logistická 22.',
            'Posledné potvrdenie, ktoré pani Kováčová dostala, prišlo až po potvrdení skladu, takže platí.',
          ],
        },
      ],
      vysvetlenie: [
        'Zmena po vychystaní má tri miesta: objednávka v systéme, štítok na zásielke a informácia pre zákazníka. Hotová je až vtedy, keď sedia všetky tri.',
        'Overenie objednávky a zastavenie expedície patria pred odvoz. Ich poradie môže byť opačné, ak hrozí, že zásielka odíde.',
        'Platné je až potvrdenie, ktoré zákazník dostane po potvrdení skladu.',
      ],
    },
    {
      id: 's3-koniec-odislo',
      typ: 'zaver',
      nadpis: 'Zásielka odišla na starú adresu',
      vysledok: 'chyba',
      pribeh: [
        {
          typ: 'text',
          text: [
            'Zásielka odišla o 15:00 na Sklad A, Priemyselná 10, a zákazník dostal tovar o deň neskôr, než mohol.',
            'Sklad A ju odmietol prevziať a dopravca ju presmeroval na Sklad B až na druhý deň. Opakovaná doprava stojí 65 € (modelová suma).',
          ],
        },
      ],
      vysvetlenie: [
        'Sklad expeduje podľa vytlačeného štítku. Kým nikto nevymení štítok, zmena v systéme ani e-mail zákazníkovi nič nemenia.',
        'Do odvozu boli takmer dve hodiny. Zásielka nesmie odísť, kým sklad nepotvrdí nový štítok, a na to stačí jeden telefonát na sklad.',
      ],
      retazNasledku: [
        'zásielka odišla so starým štítkom na Sklad A',
        'Sklad A ju odmietol prevziať',
        'presmerovanie a opakovaná doprava: 65 € (modelová suma)',
        'tovar u zákazníka o deň neskôr',
      ],
    },
    {
      id: 's3-koniec-bez-potvrdenia',
      typ: 'zaver',
      nadpis: 'Zmena prebehla, zákazníčka o nej nevedela',
      vysledok: 'komplikacia',
      pribeh: [
        {
          typ: 'text',
          text: [
            'Zásielka odišla správne na Sklad B, ale potvrdenie po výmene štítku pani Kováčová nedostala.',
            'O 16:10 volá, či zmena naozaj prebehla. Sklad B o zásielke nevedel.',
          ],
        },
      ],
      vysvetlenie: [
        'Pani Kováčová písala „Ďakujem za potvrdenie.“ a čakala odpoveď. Potvrdenie po dokončení zmeny je posledný krok postupu, nie zdvorilosť navyše.',
        'Štítok bol vymenený a sklad to potvrdil. Chýbala správa pre pani Kováčovú, ktorá by to potvrdila.',
      ],
      retazNasledku: ['telefonát zákazníčky, či zmena prebehla', 'Sklad B o zásielke nevedel'],
    },
  ],
  schvalenie: {
    stav: 'schvalene',
    verziaPravidiel: 'demo-1.0',
    podklad: 'Pravidlá firmy v podkladoch situácie (modelové pravidlá)',
    potvrdil: 'autor ukážky',
    datum: '2026-09-15',
  },
};
