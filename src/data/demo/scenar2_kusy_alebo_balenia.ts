import type { Scenar } from '../types';

/**
 * Scenár 2: Kusy alebo balenia
 * Precvičuje kontrolu mernej jednotky a celkovej ceny objednávky.
 * Čísla: 1 balenie = 6 ks, 84 € / balenie (14 € / ks).
 * Správne: 3 bal = 18 ks = 252 €. Chybne: 18 bal = 108 ks = 1 512 €. Oprava expedície: 45 € doprava.
 */
export const KUSOV_V_BALENI = 6;
export const CENA_BALENIA = 84;
export const POZADOVANE_KUSY = 18;
export const NAKLAD_OPRAVY = 45;

export const kusyAleboBalenia: Scenar = {
  id: 'kusy-alebo-balenia',
  verzia: '1.0',
  nazov: 'Kusy alebo balenia',
  strucnyProblem:
    'Zákazník píše „18 kusov“. Formulár počíta v baleniach po 6 kusov. Jedna číslica rozhodne, či faktúra bude na 252 € alebo 1 512 €.',
  pozicia: 'Pracovník príjmu objednávok',
  cvici: 'Kontrola mernej jednotky a celkovej ceny objednávky.',
  zadanie: [
    'Je pondelok, 14:05. Zadávate objednávky do systému DEMO DISTRIBÚCIE. Prišla krátka objednávka od stáleho zákazníka, ktorý píše v kusoch. Produkt sa však predáva v baleniach.',
    'Vašou úlohou je zadať objednávku tak, aby zákazník dostal presne to, čo žiada, a faktúru na správnu sumu.',
  ],
  podklady: [
    {
      id: 's2-email',
      nazov: 'E-mail zákazníka',
      druh: 'email',
      bloky: [
        {
          typ: 'email',
          od: 'Martin Kolár, Autoservis Kolár s. r. o. (modelový zákazník)',
          komu: 'príjem objednávok, DEMO DISTRIBÚCIA',
          predmet: 'Objednávka – kotviace spony K-6',
          datum: 'pondelok 13:52',
          text: [
            'Dobrý deň,',
            'objednávame 18 kusov kotviacich spôn K-6, dodanie štandardne na našu adresu.',
            'Ďakujem, Martin Kolár',
          ],
        },
      ],
    },
    {
      id: 's2-produkt',
      nazov: 'Produktová karta K-6',
      druh: 'produkt',
      bloky: [
        {
          typ: 'zaznam',
          nadpis: 'Produktová karta',
          polia: [
            { nazov: 'Kód', hodnota: 'K-6' },
            { nazov: 'Názov', hodnota: 'Kotviaca spona K-6' },
            { nazov: 'Predajná jednotka', hodnota: 'balenie (bal)', zvyraznit: true },
            { nazov: 'Obsah balenia', hodnota: '6 ks', zvyraznit: true },
            { nazov: 'Cena za balenie', hodnota: '84 € (14 € / ks)' },
            { nazov: 'Skladom', hodnota: '40 bal' },
          ],
        },
        {
          typ: 'poznamka',
          text: ['Ceny v ukážke sú modelové a uvádzajú sa na jednotnej cenovej báze bez ďalších položiek.'],
        },
      ],
    },
    {
      id: 's2-objednavka',
      nazov: 'Objednávkový formulár',
      druh: 'objednavka',
      bloky: [
        {
          typ: 'text',
          text: [
            'Množstvo sa v objednávke zadáva v predajnej jednotke produktu. Pri K-6 je predajnou jednotkou balenie (bal) – formulár túto jednotku uvádza priamo pri poli Množstvo.',
            'Systém vedľa množstva zobrazuje prepočet na kusy a celkovú cenu. Pred potvrdením ukáže rekapituláciu.',
          ],
        },
      ],
    },
    {
      id: 's2-pravidla',
      nazov: 'Pravidlá firmy',
      druh: 'pravidla',
      bloky: [
        {
          typ: 'zoznam',
          nadpis: 'Interné pravidlá DEMO DISTRIBÚCIE pre zadávanie objednávok',
          polozky: [
            'Pred zadaním množstva pracovník otvorí produktovú kartu a zistí predajnú jednotku.',
            'Ak zákazník uvádza kusy a produkt sa predáva v baleniach, množstvo sa prepočíta a v potvrdení sa uvedú obe hodnoty (balenia aj kusy).',
            'Pred potvrdením objednávky pracovník skontroluje v rekapitulácii mernú jednotku, prepočet na kusy a celkovú cenu.',
          ],
        },
        {
          typ: 'poznamka',
          nadpis: 'Modelový následok',
          text: [
            'Oprava chybne vyexpedovanej objednávky (zvoz tovaru späť) stojí v modelovom prípade 45 € na dopravu. Vrátený tovar sa vracia na sklad – nie je to strata, ale objednávka sa prerába, faktúra sa dobropisuje a zákazník čaká.',
          ],
        },
      ],
    },
  ],
  kontrolneBody: [
    {
      id: 's2-kb-karta',
      nazov: 'Otvoril produktovú kartu pred zadaním množstva',
      vysvetlenie: 'Predajná jednotka je na produktovej karte. Bez nej sa množstvo zadáva naslepo.',
      zdrojPravidla: 'Pravidlá firmy, bod 1 (modelové pravidlo zo zadania dema)',
    },
    {
      id: 's2-kb-jednotka',
      nazov: 'Prepočítal kusy na balenia (18 ks = 3 bal)',
      vysvetlenie: 'Zákazník píše v kusoch, formulár počíta v baleniach po 6 kusov.',
      zdrojPravidla: 'Pravidlá firmy, bod 2; produktová karta K-6',
    },
    {
      id: 's2-kb-rekapitulacia',
      nazov: 'Skontroloval rekapituláciu množstva a ceny pred potvrdením',
      vysvetlenie: 'Rekapitulácia je posledné miesto, kde sa dá chyba zachytiť bez nákladov.',
      zdrojPravidla: 'Pravidlá firmy, bod 3',
    },
  ],
  vstupnyUzol: 's2-start',
  uzly: [
    {
      id: 's2-start',
      typ: 'rozhodnutie',
      nadpis: 'Objednávka od zákazníka',
      pribeh: [{ typ: 'podklad', podklad: 's2-email' }],
      uloha: 'Objednávku treba zadať do systému. Ako začnete?',
      podklady: ['s2-email', 's2-produkt'],
      moznosti: [
        {
          id: 's2-start-karta',
          text: 'Otvoriť produktovú kartu K-6 a zistiť, v akej jednotke sa predáva.',
          dalsi: 's2-karta',
          nasledok: 'Otvorili ste produktovú kartu.',
          ucinky: { 's2-kb-karta': 'splnene' },
        },
        {
          id: 's2-start-rovno',
          text: 'Zadať do objednávky množstvo 18 – presne ako píše zákazník – a pokračovať na rekapituláciu.',
          dalsi: 's2-rekap-18',
          nasledok: 'Zadali ste 18 bez kontroly jednotky.',
          ucinky: { 's2-kb-karta': 'nesplnene', 's2-kb-jednotka': 'nesplnene' },
        },
      ],
    },
    {
      id: 's2-karta',
      typ: 'rozhodnutie',
      nadpis: 'Zadanie množstva',
      pribeh: [
        { typ: 'podklad', podklad: 's2-produkt' },
        {
          typ: 'text',
          text: ['Objednávkový formulár má pole Množstvo v predajnej jednotke produktu. Zákazník žiada 18 kusov.'],
        },
      ],
      uloha: 'Zadajte množstvo do objednávkového formulára.',
      podklady: ['s2-produkt', 's2-objednavka'],
      vstup: {
        popis: 'Množstvo',
        jednotka: 'bal',
        min: 1,
        max: 99,
        krok: 1,
        prepocet: { nasobitel: KUSOV_V_BALENI, jednotkaVysledku: 'ks', cenaZaJednotku: CENA_BALENIA },
      },
      moznosti: [
        {
          id: 's2-karta-3',
          text: 'Zadané množstvo: {hodnota} bal',
          hodnoty: [3],
          dalsi: 's2-rekap-3',
          nasledok: '3 balenia = 18 kusov.',
          ucinky: { 's2-kb-jednotka': 'splnene' },
        },
        {
          id: 's2-karta-18',
          text: 'Zadané množstvo: {hodnota} bal',
          hodnoty: [18],
          dalsi: 's2-rekap-18',
          nasledok: '18 balení = 108 kusov.',
          ucinky: { 's2-kb-jednotka': 'nesplnene' },
        },
        {
          id: 's2-karta-ine',
          text: 'Zadané množstvo: {hodnota} bal',
          ostatneHodnoty: true,
          dalsi: 's2-rekap-ine',
          nasledok: 'Množstvo nezodpovedá 18 kusom.',
          ucinky: { 's2-kb-jednotka': 'nesplnene' },
        },
      ],
    },
    {
      id: 's2-rekap-3',
      typ: 'rozhodnutie',
      nadpis: 'Rekapitulácia objednávky',
      pribeh: [
        {
          typ: 'zaznam',
          nadpis: 'Rekapitulácia pred potvrdením',
          polia: [
            { nazov: 'Produkt', hodnota: 'K-6 Kotviaca spona' },
            { nazov: 'Množstvo', hodnota: '3 bal', zvyraznit: true },
            { nazov: 'Prepočet', hodnota: '18 ks', zvyraznit: true },
            { nazov: 'Cena za balenie', hodnota: '84 €' },
            { nazov: 'Celkom', hodnota: '252 €', zvyraznit: true },
          ],
        },
      ],
      uloha: 'Skontrolujte rekapituláciu. Čo urobíte?',
      podklady: ['s2-email', 's2-produkt'],
      moznosti: [
        {
          id: 's2-rekap3-potvrdit',
          text: 'Potvrdiť objednávku: 3 balenia = 18 kusov, 252 €.',
          dalsi: 's2-koniec-spravne',
          nasledok: 'Objednávka sedí so žiadosťou zákazníka.',
          ucinky: { 's2-kb-rekapitulacia': 'splnene' },
        },
        {
          id: 's2-rekap3-prepisat',
          text: 'Prepísať množstvo na 18 – zákazník predsa napísal 18.',
          dalsi: 's2-rekap-18',
          nasledok: 'Zmenili ste množstvo na 18 balení.',
          ucinky: { 's2-kb-jednotka': 'nesplnene' },
        },
      ],
    },
    {
      id: 's2-rekap-18',
      typ: 'rozhodnutie',
      nadpis: 'Rekapitulácia objednávky',
      pribeh: [
        {
          typ: 'zaznam',
          nadpis: 'Rekapitulácia pred potvrdením',
          polia: [
            { nazov: 'Produkt', hodnota: 'K-6 Kotviaca spona' },
            { nazov: 'Množstvo', hodnota: '18 bal', zvyraznit: true },
            { nazov: 'Prepočet', hodnota: '108 ks', zvyraznit: true },
            { nazov: 'Cena za balenie', hodnota: '84 €' },
            { nazov: 'Celkom', hodnota: '1 512 €', zvyraznit: true },
          ],
        },
      ],
      uloha: 'Pred potvrdením vidíte rekapituláciu. Čo urobíte?',
      podklady: ['s2-email', 's2-produkt'],
      moznosti: [
        {
          id: 's2-rekap18-potvrdit',
          text: 'Potvrdiť – množstvo 18 sedí s tým, čo zákazník napísal.',
          dalsi: 's2-koniec-expedicia',
          nasledok: 'Sklad expeduje 108 kusov.',
          naklad: NAKLAD_OPRAVY,
          ucinky: { 's2-kb-rekapitulacia': 'nesplnene' },
        },
        {
          id: 's2-rekap18-opravit',
          text: 'Zastaviť sa: 108 kusov a 1 512 € nezodpovedá požiadavke 18 kusov. Opraviť množstvo na 3 balenia.',
          dalsi: 's2-rekap-oprava',
          nasledok: 'Chybu ste zachytili v rekapitulácii.',
          ucinky: { 's2-kb-jednotka': 'splnene', 's2-kb-rekapitulacia': 'splnene' },
        },
      ],
    },
    {
      id: 's2-rekap-ine',
      typ: 'rozhodnutie',
      spatnaVazba: true,
      nadpis: 'Rekapitulácia nesedí',
      pribeh: [
        {
          typ: 'text',
          text: [
            'Rekapitulácia ukazuje iný počet kusov, než zákazník žiada (18 ks). Systém prepočítava: počet balení × 6 = počet kusov. Skontrolujte prepočet na produktovej karte.',
          ],
        },
      ],
      uloha: 'Čo urobíte?',
      podklady: ['s2-produkt', 's2-email'],
      moznosti: [
        {
          id: 's2-ine-opravit',
          text: 'Opraviť množstvo na 3 balenia (18 kusov) a skontrolovať rekapituláciu.',
          dalsi: 's2-rekap-oprava',
          nasledok: 'Opravili ste množstvo podľa prepočtu.',
          ucinky: { 's2-kb-jednotka': 'splnene', 's2-kb-rekapitulacia': 'splnene' },
        },
        {
          id: 's2-ine-potvrdit',
          text: 'Potvrdiť objednávku tak, ako je.',
          dalsi: 's2-koniec-ine',
          nasledok: 'Sklad expeduje iné množstvo, než zákazník žiadal.',
          naklad: NAKLAD_OPRAVY,
          ucinky: { 's2-kb-rekapitulacia': 'nesplnene' },
        },
      ],
    },
    {
      id: 's2-rekap-oprava',
      typ: 'rozhodnutie',
      nadpis: 'Rekapitulácia po oprave',
      pribeh: [
        {
          typ: 'zaznam',
          nadpis: 'Rekapitulácia pred potvrdením',
          polia: [
            { nazov: 'Produkt', hodnota: 'K-6 Kotviaca spona' },
            { nazov: 'Množstvo', hodnota: '3 bal', zvyraznit: true },
            { nazov: 'Prepočet', hodnota: '18 ks', zvyraznit: true },
            { nazov: 'Cena za balenie', hodnota: '84 €' },
            { nazov: 'Celkom', hodnota: '252 €', zvyraznit: true },
          ],
        },
      ],
      uloha: 'Rekapitulácia po oprave. Čo urobíte?',
      podklady: ['s2-email', 's2-produkt'],
      moznosti: [
        {
          id: 's2-oprava-potvrdit',
          text: 'Potvrdiť objednávku: 3 balenia = 18 kusov, 252 €.',
          dalsi: 's2-koniec-spravne',
          nasledok: 'Objednávka sedí so žiadosťou zákazníka.',
        },
        {
          id: 's2-oprava-overit',
          text: 'Ešte raz overiť na produktovej karte, že 1 balenie = 6 kusov, a potom potvrdiť.',
          dalsi: 's2-koniec-spravne',
          nasledok: 'Overili ste prepočet a potvrdili objednávku.',
        },
      ],
    },
    {
      id: 's2-koniec-spravne',
      typ: 'zaver',
      nadpis: 'Objednávka zadaná správne',
      vysledok: 'spravne',
      pribeh: [
        {
          typ: 'text',
          text: [
            'Objednávka je potvrdená: K-6, 3 balenia (18 kusov), 252 €. Zákazníkovi odišlo potvrdenie s oboma údajmi – balenia aj kusy. Sklad vychystal 3 balenia.',
          ],
        },
      ],
      vysvetlenie: [
        'Zákazník píše v kusoch, formulár počíta v predajnej jednotke. Predajnú jednotku ste zistili na produktovej karte skôr, ako ste zadali číslo.',
        '18 kusov ÷ 6 kusov v balení = 3 balenia. Celková cena 3 × 84 € = 252 €.',
        'Rekapituláciu ste skontrolovali pred potvrdením – tam sa chyba dá ešte opraviť bez nákladov.',
      ],
    },
    {
      id: 's2-koniec-expedicia',
      typ: 'zaver',
      nadpis: 'Vyexpedovalo sa 108 kusov',
      vysledok: 'chyba',
      pribeh: [
        {
          typ: 'text',
          text: [
            'Sklad vyexpedoval 18 balení, teda 108 kusov, s faktúrou na 1 512 €. Zákazník na druhý deň volá: objednal 18 kusov za 252 €.',
            '90 kusov (15 balení) sa vracia. Doprava späť stojí v modelovom prípade 45 €. Vrátený tovar ide späť na sklad – nie je to strata, ale objednávka sa prerába, faktúra sa dobropisuje a zákazník čaká na správny doklad.',
          ],
        },
      ],
      vysvetlenie: [
        'Číslo od zákazníka (18) bolo v kusoch, pole formulára je v baleniach. Bez produktovej karty sa to nedalo vidieť.',
        'Rekapitulácia ukazovala 108 kusov a 1 512 € – šesťnásobok toho, čo zákazník žiadal. To bol posledný okamih na opravu.',
        'Modelový náklad 45 € je doprava pri oprave expedície. Cena objednávky ani hodnota vráteného tovaru (90 × 14 € = 1 260 €) nie sú strata – tovar sa vrátil na sklad.',
      ],
    },
    {
      id: 's2-koniec-ine',
      typ: 'zaver',
      nadpis: 'Zásielka nezodpovedala objednávke',
      vysledok: 'chyba',
      pribeh: [
        {
          typ: 'text',
          text: [
            'Sklad vyexpedoval množstvo, ktoré nezodpovedalo požiadavke zákazníka (18 kusov). Zásielka sa musela prerábať; doprava naspäť stojí v modelovom prípade 45 €.',
          ],
        },
      ],
      vysvetlenie: [
        'Správny prepočet: 18 kusov ÷ 6 kusov v balení = 3 balenia, 3 × 84 € = 252 €.',
        'Rekapitulácia nesedela s požiadavkou a systém prepočet ukazoval. Chyba sa dala zachytiť pred potvrdením.',
        'Modelový náklad 45 € je doprava pri oprave; hodnota tovaru nie je strata, tovar sa vrátil na sklad.',
      ],
    },
  ],
  schvalenie: {
    stav: 'schvalene',
    verziaPravidiel: 'demo-1.0',
    podklad: 'Zadanie projektu Chyby na skúšku, kapitola 8, scenár 2 (modelové pravidlá)',
    potvrdil: 'autor zadania (demo)',
    datum: '2026-09-15',
  },
};
