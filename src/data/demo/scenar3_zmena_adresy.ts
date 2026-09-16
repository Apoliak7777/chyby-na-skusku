import type { Scenar } from '../types';

/**
 * Scenár 3: Zmena adresy na poslednú chvíľu
 * Precvičuje dokončenie zmeny objednávky vrátane skladu a prepravných údajov.
 * Uznáva viac správnych poradí (overenie ↔ zastavenie expedície).
 */
export const NAKLAD_OPAKOVANEJ_DOPRAVY = 65;

export const zmenaAdresy: Scenar = {
  id: 'zmena-adresy',
  verzia: '1.0',
  nazov: 'Zmena adresy na poslednú chvíľu',
  strucnyProblem:
    'Zákazník mení dodaciu adresu. Zásielka je vychystaná, štítok vytlačený, odvoz o 15:00. Prepísať adresu v systéme nestačí.',
  pozicia: 'Pracovník príjmu objednávok',
  cvici: 'Dokončenie zmeny objednávky vrátane skladu a prepravných údajov.',
  zadanie: [
    'Je štvrtok, 13:10. Objednávka D-1042 je vychystaná na rampe, prepravný štítok je vytlačený a dopravca ju preberie o 15:00. Práve prišiel e-mail so žiadosťou o zmenu dodacej adresy.',
    'Vašou úlohou je zmenu dokončiť tak, aby zásielka odišla na správne miesto – a zákazníkovi to potvrdiť až vtedy, keď to platí.',
  ],
  podklady: [
    {
      id: 's3-email',
      nazov: 'E-mail zákazníka',
      druh: 'email',
      bloky: [
        {
          typ: 'email',
          od: 'Mgr. Jana Kováčová, nákup, Montáže Ďurica s. r. o. (modelový zákazník)',
          komu: 'príjem objednávok, DEMO DISTRIBÚCIA',
          predmet: 'Zmena dodacej adresy – objednávka D-1042',
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
            'Sklad expeduje podľa vytlačeného štítku. Zmena adresy v systéme štítok automaticky nepretlačí – sklad musí dostať pokyn a starý štítok vymeniť.',
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
          nadpis: 'Modelový následok',
          text: [
            'Ak zásielka odíde na pôvodnú adresu, presmerovanie a opakovaná doprava stoja v modelovom prípade 65 €. Suma je ilustračná a platí len pre vetvy, ktoré k nej naozaj vedú.',
          ],
        },
      ],
    },
  ],
  kontrolneBody: [
    {
      id: 's3-kb-overenie',
      nazov: 'Overil číslo objednávky a oprávnenú kontaktnú osobu',
      vysvetlenie: 'Zmenu môže žiadať len osoba uvedená v objednávke. Overenie chráni pred zmenou od nesprávnej osoby.',
      zdrojPravidla: 'Pravidlá firmy, bod 1 (modelové pravidlo zo zadania dema)',
    },
    {
      id: 's3-kb-expedicia',
      nazov: 'Zastavil expedíciu a zabezpečil výmenu štítku s potvrdením skladu',
      vysvetlenie: 'Sklad expeduje podľa štítku. Kým expedícia stojí a štítok nie je vymenený, zmena v systéme nič nemení.',
      zdrojPravidla: 'Pravidlá firmy, body 2 a 4; stav expedície',
    },
    {
      id: 's3-kb-fakturacna',
      nazov: 'Zmenil len dodaciu adresu, fakturačnú ponechal',
      vysvetlenie: 'Zákazník výslovne píše, že fakturačná adresa zostáva. Zmenená by pokazila faktúru.',
      zdrojPravidla: 'Pravidlá firmy, bod 3; e-mail zákazníka',
    },
    {
      id: 's3-kb-potvrdenie',
      nazov: 'Potvrdil zákazníkovi až po dokončení zmeny',
      vysvetlenie: 'Potvrdenie, ktoré ešte neplatí, je horšie ako žiadne – zákazník sa naň spoľahne.',
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
      podklady: ['s3-email', 's3-objednavka', 's3-pravidla'],
      moznosti: [
        {
          id: 's3-start-overit',
          text: 'Overiť v objednávke D-1042 číslo, stav a to, či je pani Kováčová oprávnená kontaktná osoba.',
          dalsi: 's3-po-overeni',
          nasledok: 'Objednávku a oprávnenie ste overili.',
          ucinky: { 's3-kb-overenie': 'splnene' },
        },
        {
          id: 's3-start-zastavit',
          text: 'Najprv zavolať na sklad a zastaviť expedíciu D-1042, detaily overiť hneď potom.',
          dalsi: 's3-zastavene-prv',
          nasledok: 'Expedícia stojí, zásielka neodíde.',
        },
        {
          id: 's3-start-predcasne',
          text: 'Odpísať pani Kováčovej, že je to vybavené, a zmenu spraviť po obede.',
          dalsi: 's3-predcasne',
          nasledok: 'Zákazník dostal potvrdenie, ktoré ešte neplatí.',
          ucinky: { 's3-kb-potvrdenie': 'nesplnene' },
        },
        {
          id: 's3-start-hlavicka',
          text: 'Prepísať dodaciu adresu v hlavičke objednávky a odpísať, že je zmenené.',
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
          text: 'Zavolať na sklad: zastaviť expedíciu D-1042, zásielka nesmie odísť, kým sa nevymení štítok.',
          dalsi: 's3-uprava-adresy',
          nasledok: 'Expedícia stojí.',
        },
        {
          id: 's3-overene-prepisat',
          text: 'Prepísať dodaciu adresu v objednávke; sklad uvidí zmenu v systéme.',
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
          text: 'Overiť objednávku D-1042 a oprávnenie pani Kováčovej, potom upraviť adresu.',
          dalsi: 's3-uprava-adresy',
          nasledok: 'Objednávku a oprávnenie ste overili.',
          ucinky: { 's3-kb-overenie': 'splnene' },
        },
        {
          id: 's3-zastavene-diktovat',
          text: 'Rovno nadiktovať skladu novú adresu z e-mailu, overovanie je zdržanie.',
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
            'V objednávke D-1042 je pani Kováčová uvedená ako oprávnená osoba – tentoraz to sedí, ale bez overenia ste to nevedeli.',
          ],
        },
      ],
      uloha: 'Ako pokračujete?',
      podklady: ['s3-objednavka', 's3-pravidla'],
      moznosti: [
        {
          id: 's3-bezoverenia-overit',
          text: 'Overiť objednávku a oprávnenie teraz a až potom zadať zmenu adresy.',
          dalsi: 's3-uprava-adresy',
          nasledok: 'Overenie ste doplnili.',
          ucinky: { 's3-kb-overenie': 'splnene' },
        },
        {
          id: 's3-bezoverenia-pokracovat',
          text: 'Pokračovať bez overenia – e-mail vyzerá dôveryhodne.',
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
            'Adresa v objednávke je zmenená. O 14:35 volá sklad: „D-1042 má štítok na Sklad A a dopravca príde o 25 minút. V systéme vidím inú adresu, ale štítok je vytlačený – čo platí?“',
          ],
        },
      ],
      uloha: 'Čo urobíte?',
      podklady: ['s3-sklad', 's3-pravidla'],
      moznosti: [
        {
          id: 's3-bezzastavenia-zastavit',
          text: 'Zastaviť expedíciu a požiadať sklad o výmenu štítku s potvrdením.',
          dalsi: 's3-potvrdenie-skladu',
          nasledok: 'Sklad zásielku zadržal a mení štítok.',
          ucinky: { 's3-kb-expedicia': 'splnene' },
        },
        {
          id: 's3-bezzastavenia-poslat',
          text: 'Povedať skladu, nech to pošle – dopravca si adresu prečíta zo systému.',
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
            'Expedícia D-1042 stojí. Otvorili ste editáciu objednávky. Na zásielke na rampe je stále štítok na Sklad A – sklad expeduje podľa štítku, nie podľa hlavičky.',
          ],
        },
        { typ: 'podklad', podklad: 's3-objednavka' },
      ],
      uloha: 'Ktoré údaje upravíte a čo so štítkom?',
      podklady: ['s3-email', 's3-objednavka', 's3-sklad'],
      moznosti: [
        {
          id: 's3-uprava-len-dodacia',
          text: 'Zmeniť len dodaciu adresu na Sklad B, Logistická 22 a hneď požiadať sklad o výmenu štítku s potvrdením.',
          dalsi: 's3-potvrdenie-skladu',
          nasledok: 'Dodacia adresa je nová, fakturačná pôvodná, sklad mení štítok.',
          ucinky: { 's3-kb-fakturacna': 'splnene', 's3-kb-expedicia': 'splnene' },
        },
        {
          id: 's3-uprava-obe',
          text: 'Zmeniť dodaciu aj fakturačnú adresu na Sklad B, nech je všetko jednotné, a požiadať sklad o výmenu štítku.',
          dalsi: 's3-fakturacna-zmenena',
          nasledok: 'Zmenili ste aj fakturačnú adresu.',
          ucinky: { 's3-kb-fakturacna': 'nesplnene', 's3-kb-expedicia': 'splnene' },
        },
        {
          id: 's3-uprava-bez-stitku',
          text: 'Zmeniť len dodaciu adresu a odpísať zákazníkovi, že je hotovo – sklad si štítok vymení podľa systému.',
          dalsi: 's3-predcasne-stitok',
          nasledok: 'Zákazník má potvrdenie, sklad nemá pokyn.',
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
          text: 'Vrátiť fakturačnú adresu na pôvodnú, zmenená ostane len dodacia.',
          dalsi: 's3-potvrdenie-skladu',
          nasledok: 'Fakturačná adresa je späť pôvodná.',
          ucinky: { 's3-kb-fakturacna': 'splnene' },
        },
        {
          id: 's3-fakturacna-nechat',
          text: 'Nechať obe adresy zmenené, zákazník si to prípadne opraví.',
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
            'O 14:50 volá sklad: „D-1042 ide o desať minút, štítok máme na Sklad A. Nikto nám nepovedal, že sa má meniť.“ Zákazník má od vás potvrdenie, že zmena je hotová.',
          ],
        },
      ],
      uloha: 'Čo urobíte?',
      podklady: ['s3-sklad', 's3-pravidla'],
      moznosti: [
        {
          id: 's3-predcasnestitok-vymenit',
          text: 'Okamžite požiadať o výmenu štítku a vyžiadať potvrdenie skladu.',
          dalsi: 's3-potvrdenie-skladu',
          nasledok: 'Sklad mení štítok na poslednú chvíľu.',
          ucinky: { 's3-kb-expedicia': 'splnene' },
        },
        {
          id: 's3-predcasnestitok-nechat',
          text: 'Nechať to tak – systém má novú adresu, dopravca sa zorientuje.',
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
          text: 'Odpovedať pani Kováčovej: zmena dodacej adresy dokončená, fakturačná adresa bez zmeny, sklad potvrdil nový štítok.',
          dalsi: 's3-koniec-spravne',
          nasledok: 'Zákazník má potvrdenie, ktoré platí.',
          ucinky: { 's3-kb-potvrdenie': 'splnene' },
        },
        {
          id: 's3-potvrdenie-neposlat',
          text: 'Nič neposielať – zákazník uvidí novú adresu v sledovaní zásielky.',
          dalsi: 's3-koniec-bez-potvrdenia',
          nasledok: 'Zákazník o dokončení nevie.',
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
            'Dodacia adresa v hlavičke objednávky je zmenená a zákazník má vaše potvrdenie. Na rampe však leží D-1042 so štítkom na Sklad A – a sklad expeduje podľa štítku, nie podľa hlavičky.',
          ],
        },
        { typ: 'podklad', podklad: 's3-sklad' },
      ],
      uloha: 'Čo urobíte?',
      podklady: ['s3-sklad', 's3-pravidla'],
      moznosti: [
        {
          id: 's3-hlavicka-zastavit',
          text: 'Zavolať na sklad: zastaviť expedíciu a vyžiadať výmenu štítku s potvrdením.',
          dalsi: 's3-potvrdenie-skladu',
          nasledok: 'Sklad zásielku zadržal a mení štítok.',
          ucinky: { 's3-kb-expedicia': 'splnene' },
        },
        {
          id: 's3-hlavicka-nechat',
          text: 'Nechať tak – systém má novú adresu, sklad si to všimne.',
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
            'O 15:00 dopravca prevzal D-1042 so štítkom Sklad B, Logistická 22. Faktúra ide na pôvodnú fakturačnú adresu. Pani Kováčová má potvrdenie s vyjadrením skladu.',
          ],
        },
      ],
      vysvetlenie: [
        'Zmena po vychystaní má tri miesta: objednávka v systéme, štítok na zásielke a informácia pre zákazníka. Hotová je až vtedy, keď sedia všetky tri.',
        'Poradie overenia a zastavenia expedície môže byť ľubovoľné – dôležité je, že obe prebehli pred odvozom.',
        'Zákazníkovi ste potvrdili až s potvrdením skladu v ruke. Také potvrdenie platí.',
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
            'O 15:00 zásielka odišla na Sklad A, Priemyselná 10. Sklad A ju odmietol prevziať a dopravca ju presmeroval na Sklad B až na druhý deň. Opakovaná doprava stojí v modelovom prípade 65 €. Zákazník dostal tovar o deň neskôr, než mohol.',
          ],
        },
      ],
      vysvetlenie: [
        'Sklad expeduje podľa vytlačeného štítku. Kým nikto nevymení štítok, zmena v systéme ani e-mail zákazníkovi nič nemenia.',
        'Do odvozu bolo takmer dvoch hodín. Jeden telefonát na sklad – zastaviť expedíciu – zmrazil situáciu a dal čas na všetko ostatné.',
        'Suma 65 € je ilustračný následok tejto konkrétnej vetvy.',
      ],
    },
    {
      id: 's3-koniec-bez-potvrdenia',
      typ: 'zaver',
      nadpis: 'Zmena prebehla, zákazník o nej nevedel',
      vysledok: 'komplikacia',
      pribeh: [
        {
          typ: 'text',
          text: [
            'Zásielka odišla správne na Sklad B. O 16:10 však volá pani Kováčová, či zmena prebehla – potvrdenie nedostala a Sklad B o zásielke nevedel. Zmena bola dokončená, ale zákazník o tom nevedel.',
          ],
        },
      ],
      vysvetlenie: [
        'Zákazník písal „ďakujem za potvrdenie“ – čakal odpoveď. Potvrdenie po dokončení zmeny je posledný krok postupu, nie zdvorilosť navyše.',
        'Zvyšok postupu bol v poriadku: overenie, zastavenie expedície, správna adresa aj vymenený štítok.',
      ],
    },
  ],
  schvalenie: {
    stav: 'schvalene',
    verziaPravidiel: 'demo-1.0',
    podklad: 'Zadanie projektu Chyby na skúšku, kapitola 8, scenár 3 (modelové pravidlá)',
    potvrdil: 'autor zadania (demo)',
    datum: '2026-09-15',
  },
};
