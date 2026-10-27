import type { Scenar } from '../types';

/**
 * Scenár 1: Sľúbený termín
 * Precvičuje overenie skutočnej dostupnosti a potvrdenie alternatívy zákazníkom.
 * Všetky mená, produkty, čísla objednávok a sumy sú modelové (DEMO DISTRIBÚCIA).
 *
 * Pri prvom rozhodnutí vidí pracovník len to, čo nováčik naozaj vidí: e-mail a stav
 * „na sklade 12 ks“. Rezervácie a voľná zásoba sú v skladovom prehľade, ktorý si musí otvoriť.
 */
export const slubenyTermin: Scenar = {
  id: 'slubeny-termin',
  verzia: '1.1',
  nazov: 'Sľúbený termín',
  strucnyProblem: 'Zákazník chce 8 kusov do piatka. Systém ukazuje 12 na sklade. Potvrdíte mu to?',
  pozicia: 'Pracovník príjmu objednávok',
  cvici: 'overenie skutočnej dostupnosti a potvrdenie alternatívy zákazníkom.',
  zadanie: ['Streda 9:40, príjem objednávok. Stály zákazník potrebuje tovar do piatka a čaká na odpoveď.'],
  typickaChyba: 's1-start-potvrdit',
  podklady: [
    {
      id: 's1-email',
      nazov: 'E-mail zákazníka',
      druh: 'email',
      bloky: [
        {
          typ: 'email',
          od: 'Ing. Peter Vrábel, Dielne Vrábel s. r. o.',
          komu: 'príjem objednávok, DEMO DISTRIBÚCIA',
          predmet: 'Konzoly L-240, 8 ks do piatka',
          datum: 'streda 9:31',
          text: [
            'Dobrý deň,',
            'potrebujeme 8 ks konzol L-240 (dĺžka 240 mm, nosnosť aspoň 35 kg, montáž na štandardnú lištu). Montáž máme v sobotu, takže tovar potrebujeme v jednej dodávke najneskôr v piatok.',
            'Viete nám termín potvrdiť? S pozdravom, Peter Vrábel',
          ],
        },
      ],
    },
    {
      id: 's1-sklad',
      nazov: 'Skladový prehľad',
      druh: 'sklad',
      bloky: [
        {
          typ: 'tabulka',
          nadpis: 'Stav skladu, streda 9:35',
          stlpce: ['Produkt', 'Fyzicky', 'Rezervované', 'Voľné', 'Najbližšie naskladnenie'],
          riadky: [
            ['L-240 konzola 240 mm', '12 ks', '9 ks (obj. D-1038, expedícia štvrtok)', '3 ks', 'utorok budúci týždeň'],
            ['L-240B konzola 240 mm', '14 ks', '4 ks', '10 ks', 'piatok budúci týždeň'],
          ],
          poznamka:
            'Voľné = fyzicky − rezervované. Rezervované kusy patria už potvrdeným objednávkam iných zákazníkov.',
        },
      ],
    },
    {
      id: 's1-porovnanie',
      nazov: 'Porovnanie L-240 a L-240B',
      druh: 'porovnanie',
      bloky: [
        {
          typ: 'tabulka',
          nadpis: 'Schválená alternatíva (interný list náhrad)',
          stlpce: ['Parameter', 'L-240', 'L-240B', 'Požiadavka zákazníka'],
          riadky: [
            ['Dĺžka', '240 mm', '240 mm', '240 mm'],
            ['Nosnosť', '40 kg', '45 kg', 'aspoň 35 kg'],
            ['Montáž', 'štandardná lišta, 2 skrutky', 'štandardná lišta, 2 skrutky', 'štandardná lišta'],
            ['Povrch', 'práškový lak', 'pozink', 'neuvedené'],
            ['Cena', '42 € / ks', '42 € / ks', 'neuvedené'],
          ],
        },
        {
          typ: 'poznamka',
          text: [
            'L-240B je vedený ako schválená náhrada za L-240. Zámenu musí zákazník písomne potvrdiť (e-mail stačí), až potom sa rezervuje a potvrdzuje termín.',
          ],
        },
      ],
    },
    {
      id: 's1-pravidla',
      nazov: 'Pravidlá firmy',
      druh: 'pravidla',
      bloky: [
        {
          typ: 'zoznam',
          nadpis: 'Interné pravidlá DEMO DISTRIBÚCIE pre potvrdzovanie termínov',
          polozky: [
            'Termín sa zákazníkovi sľubuje výhradne podľa voľnej zásoby (fyzicky − rezervované), nie podľa fyzického stavu.',
            'Rezervované kusy patria potvrdeným objednávkam. Presunúť ich môže len vedúci predaja so súhlasom dotknutého zákazníka.',
            'Alternatívny produkt musí zákazník písomne potvrdiť skôr, ako sa rezervuje a potvrdí termín.',
            'Termín sa potvrdzuje až po vytvorení rezervácie v systéme.',
          ],
        },
        {
          typ: 'poznamka',
          nadpis: 'Následok',
          text: [
            'Ak treba po neoprávnenom prísľube tovar expresne doobjednať od dodávateľa, stojí to 120 € navyše (modelová suma).',
          ],
        },
      ],
    },
  ],
  kontrolneBody: [
    {
      id: 's1-kb-volna-zasoba',
      nazov: 'Overil voľnú zásobu pred prísľubom termínu',
      vysvetlenie: 'Rozhoduje voľná zásoba (fyzicky − rezervované), nie počet kusov na regáli.',
      zdrojPravidla: 'Pravidlá firmy, bod 1',
    },
    {
      id: 's1-kb-alternativa',
      nazov: 'Ponúkol schválenú alternatívu podľa porovnania',
      vysvetlenie: 'Keď voľná zásoba nestačí, ponúka sa schválená náhrada doložená porovnaním parametrov.',
      zdrojPravidla: 'Porovnanie L-240 a L-240B (interný list náhrad)',
    },
    {
      id: 's1-kb-potvrdenie',
      nazov: 'Získal písomné potvrdenie alternatívy od zákazníka',
      vysvetlenie: 'Porovnanie parametrov nenahrádza súhlas zákazníka. Bez potvrdenia môže zásielku odmietnuť.',
      zdrojPravidla: 'Pravidlá firmy, bod 3',
    },
    {
      id: 's1-kb-rezervacia',
      nazov: 'Potvrdil termín až po rezervácii podľa podkladov',
      vysvetlenie: 'Medzi potvrdením a rezerváciou sa zásoba môže zmeniť. Najprv rezervácia, potom potvrdenie.',
      zdrojPravidla: 'Pravidlá firmy, bod 4',
    },
  ],
  vstupnyUzol: 's1-start',
  uzly: [
    {
      id: 's1-start',
      typ: 'rozhodnutie',
      nadpis: 'Otázka zákazníka',
      pribeh: [
        { typ: 'podklad', podklad: 's1-email' },
        {
          typ: 'zaznam',
          nadpis: 'Objednávkový systém: L-240',
          polia: [{ nazov: 'Na sklade', hodnota: '12 ks', zvyraznit: true }],
        },
      ],
      uloha: 'Zákazník čaká na odpoveď. Čo urobíte?',
      podklady: ['s1-email'],
      moznosti: [
        {
          id: 's1-start-potvrdit',
          text: 'Potvrdiť piatok. Na sklade je 12 kusov.',
          dalsi: 's1-slub-bez-kontroly',
          nasledok: 'Zákazník dostal potvrdenie termínu bez overenia zásoby.',
          ucinky: { 's1-kb-volna-zasoba': 'nesplnene' },
        },
        {
          id: 's1-start-overit',
          text: 'Odpovedať až po kontrole rezervácií.',
          dalsi: 's1-sklad',
          nasledok: 'Otvorili ste skladový prehľad.',
        },
      ],
    },
    {
      id: 's1-slub-bez-kontroly',
      typ: 'rozhodnutie',
      spatnaVazba: true,
      nadpis: 'Sklad volá',
      pribeh: [
        {
          typ: 'text',
          text: [
            'Odpísali ste: „Piatok potvrdzujeme.“ O 10:30 volá vedúci skladu: L-240 je fyzicky 12 kusov, ale 9 je rezervovaných pre objednávku D-1038, ktorá sa expeduje vo štvrtok. Voľné sú 3 kusy a ďalšie naskladnenie je až v utorok.',
          ],
        },
        { typ: 'podklad', podklad: 's1-sklad' },
      ],
      uloha: 'Zákazník už má vaše potvrdenie na 8 kusov. Ako to napravíte?',
      podklady: ['s1-sklad', 's1-pravidla'],
      moznosti: [
        {
          id: 's1-slub-express',
          text: 'Objednať chýbajúce kusy expresne od dodávateľa.',
          dalsi: 's1-koniec-express',
          nasledok: 'Firma zaplatila expresné doplnenie.',
          naklad: 120,
          ucinky: { 's1-kb-rezervacia': 'nesplnene' },
        },
        {
          id: 's1-slub-oprava',
          text: 'Zavolať zákazníkovi a povedať mu skutočný stav.',
          dalsi: 's1-navrh-po-oprave',
          nasledok: 'Zákazník pozná skutočný stav a čaká na návrh.',
          ucinky: { 's1-kb-volna-zasoba': 'splnene' },
        },
      ],
    },
    {
      id: 's1-sklad',
      typ: 'rozhodnutie',
      nadpis: 'Skladový prehľad',
      pribeh: [{ typ: 'podklad', podklad: 's1-sklad' }],
      uloha: 'Koľko kusov L-240 môžete zákazníkovi do piatka záväzne sľúbiť?',
      podklady: ['s1-sklad', 's1-pravidla'],
      moznosti: [
        {
          id: 's1-sklad-12',
          text: '12 kusov.',
          dalsi: 's1-sklad-fyzicka',
          nasledok: 'Počítali ste s fyzickou zásobou.',
          ucinky: { 's1-kb-volna-zasoba': 'nesplnene' },
        },
        {
          id: 's1-sklad-3',
          text: '3 kusy.',
          dalsi: 's1-navrh',
          nasledok: 'Vychádzate z voľnej zásoby.',
          ucinky: { 's1-kb-volna-zasoba': 'splnene' },
        },
        {
          id: 's1-sklad-8',
          text: '8 kusov.',
          dalsi: 's1-sklad-rezervy',
          nasledok: 'Siahli ste na rezervácie iného zákazníka.',
          ucinky: { 's1-kb-volna-zasoba': 'nesplnene' },
        },
      ],
    },
    {
      id: 's1-sklad-fyzicka',
      typ: 'rozhodnutie',
      spatnaVazba: true,
      nadpis: 'Fyzicky nie je voľné',
      pribeh: [
        {
          typ: 'text',
          text: [
            'Vedúci skladu vás zastavil: „Z tých 12 kusov je 9 rezervovaných pre D-1038, tá ide vo štvrtok. Voľné sú tri.“',
            'Fyzická zásoba nie je to isté ako voľná zásoba. Rezervované kusy sú už sľúbené inému zákazníkovi.',
          ],
        },
      ],
      uloha: 'Ako budete pokračovať?',
      podklady: ['s1-sklad', 's1-pravidla'],
      moznosti: [
        {
          id: 's1-fyzicka-oprava',
          text: 'Počítať s 3 voľnými kusmi.',
          dalsi: 's1-navrh',
          nasledok: 'Prepočítali ste to podľa voľnej zásoby.',
          ucinky: { 's1-kb-volna-zasoba': 'splnene' },
        },
        {
          id: 's1-fyzicka-slubit',
          text: 'Sľúbiť 8 kusov a D-1038 posunúť o deň.',
          dalsi: 's1-koniec-kolizia',
          nasledok: 'Dve objednávky počítajú s tými istými kusmi.',
          naklad: 120,
          ucinky: { 's1-kb-rezervacia': 'nesplnene' },
        },
      ],
    },
    {
      id: 's1-sklad-rezervy',
      typ: 'rozhodnutie',
      spatnaVazba: true,
      nadpis: 'Rezervácie nie sú voľné',
      pribeh: [
        {
          typ: 'text',
          text: [
            'Rezervovaných 9 kusov patrí potvrdenej objednávke D-1038 iného zákazníka. Podľa pravidiel ich môže presunúť len vedúci predaja so súhlasom toho zákazníka, a ten súhlas nemáte.',
          ],
        },
      ],
      uloha: 'Ako budete pokračovať?',
      podklady: ['s1-pravidla', 's1-sklad'],
      moznosti: [
        {
          id: 's1-rezervy-oprava',
          text: 'Počítať s 3 voľnými kusmi.',
          dalsi: 's1-navrh',
          nasledok: 'Rezervácie ste nechali tak, počítate s 3 voľnými kusmi.',
          ucinky: { 's1-kb-volna-zasoba': 'splnene' },
        },
        {
          id: 's1-rezervy-presunut',
          text: 'Presunúť časť rezervácie D-1038 a vedúcemu to povedať potom.',
          dalsi: 's1-koniec-kolizia',
          nasledok: 'Objednávka D-1038 prišla o svoje kusy.',
          naklad: 120,
          ucinky: { 's1-kb-rezervacia': 'nesplnene' },
        },
      ],
    },
    {
      id: 's1-navrh',
      typ: 'rozhodnutie',
      nadpis: 'Návrh zákazníkovi',
      pribeh: [
        {
          typ: 'text',
          text: [
            'Voľné sú 3 kusy L-240, zákazník potrebuje 8 v jednej dodávke do piatka. V podkladoch máte porovnanie so schválenou alternatívou L-240B: voľných 10 kusov, spĺňa všetky parametre, ktoré zákazník uviedol.',
          ],
        },
        { typ: 'podklad', podklad: 's1-porovnanie' },
      ],
      uloha: 'Čo navrhnete zákazníkovi?',
      podklady: ['s1-porovnanie', 's1-pravidla'],
      moznosti: [
        {
          id: 's1-navrh-alternativa',
          text: 'Poslať zákazníkovi porovnanie a opýtať sa, či L-240B berie.',
          dalsi: 's1-zakaznik-odpoved',
          nasledok: 'Zákazník dostal návrh s porovnaním a žiadosť o potvrdenie.',
          ucinky: { 's1-kb-alternativa': 'splnene', 's1-kb-potvrdenie': 'splnene' },
        },
        {
          id: 's1-navrh-rovno-rezervovat',
          text: 'Rezervovať 8 kusov L-240B a potvrdiť zákazníkovi piatok.',
          dalsi: 's1-bez-potvrdenia',
          nasledok: 'Rezervovali a potvrdili ste bez súhlasu zákazníka.',
          ucinky: { 's1-kb-alternativa': 'splnene', 's1-kb-potvrdenie': 'nesplnene' },
        },
        {
          id: 's1-navrh-rozdelit',
          text: 'Ponúknuť 3 kusy v piatok a zvyšok v utorok.',
          dalsi: 's1-rozdelena',
          nasledok: 'Navrhli ste rozdelenú dodávku.',
          ucinky: { 's1-kb-alternativa': 'nesplnene' },
        },
        {
          id: 's1-navrh-slubit',
          text: 'Potvrdiť 8 kusov L-240 a požiadať sklad, nech ich do piatka zabezpečí.',
          dalsi: 's1-koniec-express',
          nasledok: 'Potvrdili ste tovar, ktorý firma nemá voľný.',
          naklad: 120,
          ucinky: { 's1-kb-alternativa': 'nesplnene', 's1-kb-rezervacia': 'nesplnene' },
        },
      ],
    },
    {
      id: 's1-navrh-po-oprave',
      typ: 'rozhodnutie',
      nadpis: 'Návrh zákazníkovi po telefonáte',
      pribeh: [
        {
          typ: 'text',
          text: [
            'Zákazník ocenil, že ste zavolali hneď, ale trvá na 8 kusoch v jednej dodávke do piatka. Voľné sú 3 kusy L-240. V podkladoch máte porovnanie so schválenou alternatívou L-240B: voľných 10 kusov, spĺňa všetky uvedené parametre.',
          ],
        },
        { typ: 'podklad', podklad: 's1-porovnanie' },
      ],
      uloha: 'Čo mu teraz navrhnete?',
      podklady: ['s1-porovnanie', 's1-pravidla'],
      moznosti: [
        {
          id: 's1-navrh-o-alternativa',
          text: 'Poslať zákazníkovi porovnanie a opýtať sa, či L-240B berie.',
          dalsi: 's1-zakaznik-odpoved',
          nasledok: 'Zákazník dostal návrh s porovnaním a žiadosť o potvrdenie.',
          ucinky: { 's1-kb-alternativa': 'splnene', 's1-kb-potvrdenie': 'splnene' },
        },
        {
          id: 's1-navrh-o-rovno-rezervovat',
          text: 'Rezervovať 8 kusov L-240B a potvrdiť zákazníkovi piatok.',
          dalsi: 's1-bez-potvrdenia',
          nasledok: 'Rezervovali a potvrdili ste bez súhlasu zákazníka.',
          ucinky: { 's1-kb-alternativa': 'splnene', 's1-kb-potvrdenie': 'nesplnene' },
        },
        {
          id: 's1-navrh-o-rozdelit',
          text: 'Ponúknuť 3 kusy v piatok a zvyšok v utorok.',
          dalsi: 's1-rozdelena',
          nasledok: 'Navrhli ste rozdelenú dodávku.',
          ucinky: { 's1-kb-alternativa': 'nesplnene' },
        },
        {
          id: 's1-navrh-o-slubit',
          text: 'Potvrdiť 8 kusov L-240 a požiadať sklad, nech ich do piatka zabezpečí.',
          dalsi: 's1-koniec-express',
          nasledok: 'Potvrdili ste tovar, ktorý firma nemá voľný.',
          naklad: 120,
          ucinky: { 's1-kb-alternativa': 'nesplnene', 's1-kb-rezervacia': 'nesplnene' },
        },
      ],
    },
    {
      id: 's1-rozdelena',
      typ: 'rozhodnutie',
      spatnaVazba: true,
      nadpis: 'Zákazník odmieta rozdelenie',
      pribeh: [
        {
          typ: 'email',
          od: 'Ing. Peter Vrábel, Dielne Vrábel s. r. o.',
          predmet: 'RE: Konzoly L-240, 8 ks do piatka',
          datum: 'streda 10:12',
          text: [
            'Rozdelenú dodávku nemôžeme prijať, montáž máme v sobotu. Ak 8 kusov do piatka nedodáte, objednáme inde.',
          ],
        },
      ],
      uloha: 'Čo teraz?',
      podklady: ['s1-porovnanie', 's1-pravidla'],
      moznosti: [
        {
          id: 's1-rozdelena-alternativa',
          text: 'Poslať zákazníkovi porovnanie a opýtať sa, či L-240B berie.',
          dalsi: 's1-zakaznik-odpoved',
          nasledok: 'Zákazník dostal návrh s porovnaním a žiadosť o potvrdenie.',
          ucinky: { 's1-kb-alternativa': 'splnene', 's1-kb-potvrdenie': 'splnene' },
        },
        {
          id: 's1-rozdelena-slubit',
          text: 'Potvrdiť 8 kusov L-240 do piatka.',
          dalsi: 's1-koniec-express',
          nasledok: 'Potvrdili ste tovar, ktorý firma nemá voľný.',
          naklad: 120,
          ucinky: { 's1-kb-rezervacia': 'nesplnene' },
        },
      ],
    },
    {
      id: 's1-bez-potvrdenia',
      typ: 'rozhodnutie',
      spatnaVazba: true,
      nadpis: 'Zákazník alternatívu neschválil',
      pribeh: [
        {
          typ: 'text',
          text: ['Rezervovali ste 8 kusov L-240B a potvrdili piatok. Vo štvrtok ráno prišla odpoveď:'],
        },
        {
          typ: 'email',
          od: 'Ing. Peter Vrábel, Dielne Vrábel s. r. o.',
          predmet: 'RE: Konzoly L-240, 8 ks do piatka',
          datum: 'štvrtok 8:05',
          text: [
            'L-240B sme neschvaľovali. Potrebujeme rovnaký typ ako v minulej dodávke, aby regál vyzeral jednotne. Počítame s piatkom, ako ste potvrdili.',
          ],
        },
      ],
      uloha: 'Ako to vyriešite?',
      podklady: ['s1-sklad', 's1-pravidla'],
      moznosti: [
        {
          id: 's1-bezpotvrdenia-vysvetlit',
          text: 'Zavolať zákazníkovi a nechať ho vybrať: L-240B v piatok, alebo L-240 rozdelene na piatok a utorok.',
          dalsi: 's1-koniec-po-odmietnuti',
          nasledok: 'Zákazník dostal pravdivý obraz a rozhodol sa sám.',
        },
        {
          id: 's1-bezpotvrdenia-express',
          text: 'Objednať chýbajúce kusy L-240 expresne od dodávateľa.',
          dalsi: 's1-koniec-express',
          nasledok: 'Firma zaplatila expresné doplnenie.',
          naklad: 120,
          ucinky: { 's1-kb-rezervacia': 'nesplnene' },
        },
      ],
    },
    {
      id: 's1-zakaznik-odpoved',
      typ: 'rozhodnutie',
      nadpis: 'Písomné potvrdenie zákazníka',
      pribeh: [
        {
          typ: 'email',
          od: 'Ing. Peter Vrábel, Dielne Vrábel s. r. o.',
          predmet: 'RE: Konzoly L-240, 8 ks do piatka',
          datum: 'streda 10:48',
          text: [
            'Ďakujem za porovnanie. L-240B nám vyhovuje. Potvrdzujem 8 ks L-240B v jednej dodávke v piatok. Prosím o potvrdenie termínu.',
            'Peter Vrábel',
          ],
        },
      ],
      uloha: 'Máte písomné potvrdenie zámeny. Čo urobíte ako prvé?',
      podklady: ['s1-pravidla', 's1-sklad'],
      moznosti: [
        {
          id: 's1-odpoved-rezervovat',
          text: 'Rezervovať 8 kusov L-240B a poslať potvrdenie termínu.',
          dalsi: 's1-koniec-spravne',
          nasledok: 'Rezervácia je v systéme, potvrdenie odišlo po nej.',
          ucinky: { 's1-kb-rezervacia': 'splnene' },
        },
        {
          id: 's1-odpoved-potvrdit-hned',
          text: 'Poslať potvrdenie termínu a rezerváciu urobiť poobede.',
          dalsi: 's1-rezervacia-neskoro',
          nasledok: 'Potvrdenie odišlo skôr ako rezervácia.',
          ucinky: { 's1-kb-rezervacia': 'nesplnene' },
        },
        {
          id: 's1-odpoved-zly-kod',
          text: 'Rezervovať 8 kusov L-240 a poslať potvrdenie termínu.',
          dalsi: 's1-zly-kod',
          nasledok: 'Rezervovali ste iný produkt, než zákazník potvrdil.',
          ucinky: { 's1-kb-rezervacia': 'nesplnene' },
        },
      ],
    },
    {
      id: 's1-zly-kod',
      typ: 'rozhodnutie',
      spatnaVazba: true,
      nadpis: 'Systém rezerváciu odmietol',
      pribeh: [
        {
          typ: 'text',
          text: [
            'Systém hlási: L-240 voľné 3 kusy, rezerváciu na 8 kusov nemožno vytvoriť. Utorkové naskladnenie je až po piatku. Zákazník písomne potvrdil L-240B, nie L-240.',
          ],
        },
      ],
      uloha: 'Čo urobíte?',
      podklady: ['s1-sklad', 's1-pravidla'],
      moznosti: [
        {
          id: 's1-zlykod-oprava',
          text: 'Opraviť kód na L-240B, rezervovať a poslať potvrdenie termínu.',
          dalsi: 's1-koniec-spravne',
          nasledok: 'Rezervácia sedí s tým, čo zákazník potvrdil.',
          ucinky: { 's1-kb-rezervacia': 'splnene' },
        },
        {
          id: 's1-zlykod-bez-rezervacie',
          text: 'Poslať potvrdenie termínu a kód opraviť neskôr.',
          dalsi: 's1-rezervacia-neskoro',
          nasledok: 'Potvrdenie odišlo bez rezervácie.',
          ucinky: { 's1-kb-rezervacia': 'nesplnene' },
        },
      ],
    },
    {
      id: 's1-rezervacia-neskoro',
      typ: 'rozhodnutie',
      spatnaVazba: true,
      nadpis: 'Zásoba sa medzitým zmenila',
      pribeh: [
        {
          typ: 'text',
          text: [
            'Poobede otvárate systém: kolega medzitým rezervoval 4 kusy L-240B pre inú objednávku. Voľných ostalo 6, zákazník má od vás potvrdených 8 na piatok.',
          ],
        },
      ],
      uloha: 'Ako to vyriešite?',
      podklady: ['s1-sklad', 's1-pravidla'],
      moznosti: [
        {
          id: 's1-neskoro-dohodnut',
          text: 'Zavolať zákazníkovi a dohodnúť sa na rozdelení alebo inom termíne.',
          dalsi: 's1-koniec-neskora-rezervacia',
          nasledok: 'Zákazník musel ustúpiť z potvrdeného termínu.',
        },
        {
          id: 's1-neskoro-express',
          text: 'Objednať chýbajúce kusy expresne od dodávateľa.',
          dalsi: 's1-koniec-express',
          nasledok: 'Firma zaplatila expresné doplnenie.',
          naklad: 120,
        },
      ],
    },
    {
      id: 's1-koniec-spravne',
      typ: 'zaver',
      nadpis: 'Zákazka potvrdená podľa podkladov',
      vysledok: 'spravne',
      pribeh: [
        {
          typ: 'text',
          text: [
            'Rezervácia 8 × L-240B je v systéme a zákazník má potvrdený piatok, jedna dodávka.',
            'Sklad vychystá zásielku vo štvrtok popoludní. Objednávka D-1038 iného zákazníka nie je dotknutá.',
          ],
        },
      ],
      vysvetlenie: [
        'Fyzická zásoba (12 ks) nie je voľná zásoba (3 ks). Rozhoduje voľná, rezervované kusy patria iným potvrdeným objednávkam.',
        'Schválená alternatíva L-240B sa ponúka s porovnaním parametrov a zákazník ju musí písomne potvrdiť. Porovnanie nenahrádza jeho súhlas.',
        'Termín sa potvrdzuje až po vytvorení rezervácie. Medzi potvrdením a rezerváciou sa zásoba môže zmeniť.',
      ],
    },
    {
      id: 's1-koniec-express',
      typ: 'zaver',
      nadpis: 'Prísľub bez krytia',
      vysledok: 'chyba',
      pribeh: [
        {
          typ: 'text',
          text: [
            'Zákazník tovar v piatok dostal, ale len vďaka expresnému doplneniu od dodávateľa.',
            'Doplnenie stálo 120 € navyše (modelová suma). Termín bol potvrdený skôr, ako ho kryla rezervácia tovaru, ktorý zákazník chcel.',
          ],
        },
      ],
      vysvetlenie: [
        'Termín sa sľubuje podľa voľnej zásoby (3 ks), nie podľa fyzickej (12 ks), a potvrdzuje sa až po rezervácii.',
        'Keď voľná zásoba nestačí, poradie je: schválená alternatíva L-240B s 10 voľnými kusmi, písomný súhlas zákazníka, rezervácia a až potom potvrdenie termínu.',
      ],
      retazNasledku: [
        'termín potvrdený bez krytia zásobou alebo rezerváciou',
        'expresná objednávka u dodávateľa',
        '120 € navyše (modelová suma)',
        'piatok drží len vďaka expresu',
      ],
    },
    {
      id: 's1-koniec-kolizia',
      typ: 'zaver',
      nadpis: 'Dve objednávky, tie isté kusy',
      vysledok: 'chyba',
      pribeh: [
        {
          typ: 'text',
          text: [
            'Objednávka D-1038 aj vaša objednávka počítali s tými istými kusmi.',
            'Sklad to zistil vo štvrtok pri expedícii D-1038. Chýbajúce kusy firma objednala expresne za 120 € (modelová suma), zásielka D-1038 odišla o deň neskôr a vedúci predaja riešil sťažnosť jej zákazníka.',
          ],
        },
      ],
      vysvetlenie: [
        'Rezervované kusy nie sú voľné. Patria potvrdenej objednávke iného zákazníka a presunúť ich môže len vedúci predaja s jeho súhlasom.',
        'Voľné boli 3 kusy, na zvyšok bola v podkladoch schválená alternatíva L-240B.',
      ],
      retazNasledku: [
        'dve objednávky na tie isté kusy',
        'expresné doplnenie od dodávateľa: 120 € (modelová suma)',
        'zásielka D-1038 o deň neskôr',
        'sťažnosť jej zákazníka u vedúceho predaja',
      ],
    },
    {
      id: 's1-koniec-po-odmietnuti',
      typ: 'zaver',
      nadpis: 'Zákazka zachránená s posunom',
      vysledok: 'komplikacia',
      pribeh: [
        {
          typ: 'text',
          text: [
            'Zákazka sa zachránila, ale s posunom: zákazník si vybral 3 kusy L-240 v piatok a 5 v utorok a montáž posunul.',
            'Rezerváciu L-240B ste zrušili. Zrušenej rezervácii aj odvolanému potvrdeniu sa dalo vyhnúť jednou vetou v e-maile: „Prosím o potvrdenie zámeny.“',
          ],
        },
      ],
      vysvetlenie: [
        'Porovnanie parametrov hovorí, že L-240B vyhovuje technicky. Nehovorí nič o tom, čo zákazník chce, preto pravidlo žiada písomné potvrdenie zámeny.',
        'Rezervácia a potvrdenie termínu nasledujú až po súhlase zákazníka.',
        'Bez expresného nákladu, ale so zrušenou rezerváciou, odvolaným potvrdením a posunutou montážou.',
      ],
      retazNasledku: ['zrušená rezervácia L-240B', 'odvolané potvrdenie termínu', 'zákazník posunul montáž'],
    },
    {
      id: 's1-koniec-neskora-rezervacia',
      typ: 'zaver',
      nadpis: 'Potvrdenie ste museli odvolať',
      vysledok: 'komplikacia',
      pribeh: [
        {
          typ: 'text',
          text: [
            'Potvrdený termín ste museli odvolať: zákazník prijal 6 kusov L-240B v piatok a 2 kusy L-240 v utorok.',
            'Montáž rozdelil na dve časti. Bez expresného nákladu, ale s ústupkom zákazníka.',
          ],
        },
      ],
      vysvetlenie: [
        'Zásoba je spoločná pre celý tím. Kým potvrdenie nekryje rezervácia, môže voľné kusy vziať ktokoľvek.',
        'Poradie podľa pravidiel: písomné potvrdenie zákazníka → rezervácia v systéme → potvrdenie termínu.',
        'Písomné potvrdenie zámeny ste mali. Chýbala rezervácia skôr, ako odišlo potvrdenie termínu.',
      ],
      retazNasledku: ['odvolané potvrdenie termínu', 'dodávka rozdelená na piatok a utorok', 'zákazník rozdelil montáž na dve časti'],
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
