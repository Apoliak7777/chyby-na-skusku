# Scenáre: dátový model, pravidlá dema a návod na úpravu

## 1. Dátový model

Typy sú v `src/data/types.ts`. Tréning je strom: tréning → scenáre → uzly → možnosti.

| Objekt | Typ | Údaje |
|---|---|---|
| Tréning | `Trening` | `id`, `verzia`, `nazov`, `pozicia`, `rezim` (`demo` / `klient`), `znacka` (názov firmy, `jeModelova`, označenie), `scenare`, `upozornenie` |
| Scenár | `Scenar` | `id`, `verzia`, `nazov`, `strucnyProblem`, `pozicia`, `cvici`, `zadanie` (odseky), `podklady`, `vstupnyUzol`, `uzly`, `kontrolneBody`, `schvalenie` |
| Podklad | `Podklad` | `id`, `nazov`, `druh` (e-mail, sklad, produkt, objednávka, pravidlá, porovnanie, iné), `bloky` |
| Uzol – rozhodnutie | `RozhodovaciUzol` | `id`, `nadpis`, `pribeh` (bloky), `uloha`, `podklady` (dôležité pre krok), `vstup` (číselný vstup), `moznosti`, `spatnaVazba` |
| Uzol – záver | `ZaverecnyUzol` | `id`, `nadpis`, `vysledok` (`spravne` / `komplikacia` / `chyba`), `pribeh`, `vysvetlenie` |
| Možnosť | `Moznost` | `id`, `text`, `dalsi` (cieľový uzol), `nasledok`, `ucinky` (zmeny kontrolných bodov), `naklad` (modelový náklad v €), `hodnoty` / `ostatneHodnoty` (len pri číselnom vstupe) |
| Kontrolný bod | `KontrolnyBod` | `id`, `nazov`, `vysvetlenie`, `zdrojPravidla` |
| Schválenie obsahu | `SchvalenieObsahu` | `stav` (`koncept` / `schvalene`), `verziaPravidiel`, `podklad`, `potvrdil`, `datum` |
| Pokus | `Pokus` (`src/engine/pokus.ts`) | `scenar`, `kroky` (uzol, možnosť, prípadná hodnota), `aktualnyUzol`, `zacaty` |

### Bloky obsahu

Príbeh uzla aj podklady sa skladajú z blokov (`Blok`): `text`, `email`, `tabulka`, `poznamka`, `zaznam`
(záznam zo systému: produktová karta, hlavička objednávky, rekapitulácia), `zoznam` a `podklad`
(vloží podklad scenára priamo do príbehu bez duplikovania obsahu).

### Ako engine vyhodnocuje

- Stav pokusu je nemenný objekt; každá voľba vytvorí nový pokus. Návrat ku kroku `n` oreže zoznam krokov
  na `n` a používateľ rozhoduje v tom istom uzle znova. Náklady aj stavy bodov sa počítajú vždy nanovo
  z aktuálnej cesty, takže sa nič nezdvojí.
- Stav kontrolného bodu vzniká z účinkov na ceste: posledný účinok `splnene` bez predchádzajúceho
  `nesplnene` = **správne na prvý pokus**; `splnene` po skoršom `nesplnene` = **opravené po spätnej
  väzbe**; posledný účinok `nesplnene` alebo bod bez účinku po dokončení = **nevyriešené**. Počas pokusu
  je nedotknutý bod „zatiaľ neposúdený“.
- Verdikt pokusu: záver `chyba` → „Chyba s následkom“; `komplikacia` → „Dokončené s komplikáciou“;
  `spravne` → „Zvládnuté“, „Zvládnuté po oprave“ (aspoň jeden bod opravený) alebo „Dokončené
  s výhradami“ (aspoň jeden bod nevyriešený).
- Modelový náklad je súčet `naklad` na možnostiach aktuálnej cesty. Zobrazí sa len vtedy, keď je väčší
  ako nula, vždy s poznámkou, že ide o ilustračný následok vetvy.

### Číselný vstup

Uzol s `vstup` (`popis`, `jednotka`, `min`, `max`, `krok`, voliteľný `prepocet`) zobrazí pole namiesto tlačidiel.
Možnosti majú `hodnoty: [3]` (presné hodnoty) alebo `ostatneHodnoty: true` (záchytná možnosť, musí byť presne
jedna). Text možnosti môže obsahovať `{hodnota}`. `prepocet` ukáže živý prepočet pod poľom
(napr. balenia → kusy a cena). Hodnota mimo rozsahu sa odmietne s hláškou, nič sa nezapíše.

## 2. Tri scenáre dema (DEMO DISTRIBÚCIA – vymyslená firma)

Všetky mená, produkty, čísla objednávok a sumy sú modelové. Pravidlá firmy sú modelové pravidlá zo
zadania projektu (kapitola 8) a v dátach sú uvedené ako podklad „Pravidlá firmy“; `schvalenie.podklad`
na ne odkazuje.

### Scenár 1: Sľúbený termín (`slubeny-termin`)

- **Precvičuje:** overenie skutočnej dostupnosti a potvrdenie alternatívy zákazníkom.
- **Podklady:** e-mail zákazníka (8 ks L-240 v jednej dodávke do piatka), skladový prehľad (L-240:
  fyzicky 12, rezervované 9 pre D-1038, voľné 3; naskladnenie utorok; L-240B: voľných 10), porovnanie
  L-240 a L-240B (spĺňa uvedené parametre; zámenu musí zákazník písomne potvrdiť), pravidlá firmy.
- **Kontrolné body (4):** overil voľnú zásobu pred prísľubom · ponúkol schválenú alternatívu podľa
  porovnania · získal písomné potvrdenie alternatívy · potvrdil termín až po rezervácii.
- **Bezchybná cesta (4 rozhodnutia):** otvoriť sklad → 3 kusy (voľná zásoba) → ponúknuť L-240B
  s porovnaním a požiadať o písomné potvrdenie → rezervovať 8 × L-240B a až potom potvrdiť.
- **Vetvy s následkom:** okamžité potvrdenie bez kontroly vedie do spätnej väzby „Sklad volá“ (oprava
  telefonátom zákazníkovi, alebo expresné doplnenie za **120 €**); počítanie s fyzickou zásobou alebo
  siahnutie na rezervácie (spätná väzba, alebo kolízia dvoch objednávok za 120 €); rozdelená dodávka
  (zákazník odmietne, alternatíva ešte možná); rezervácia bez potvrdenia zákazníka (zákazník alternatívu
  odmietne – komplikácia bez nákladu, alebo expres 120 €); potvrdenie pred rezerváciou (kolega medzitým
  rezervoval – komplikácia, alebo expres 120 €); rezervácia nesprávneho kódu (systém ju odmietne).
- Suma 120 € je len na možnostiach, ktoré k nej vedú; správny záver je bez nákladu.

### Scenár 2: Kusy alebo balenia (`kusy-alebo-balenia`)

- **Precvičuje:** kontrola mernej jednotky a celkovej ceny objednávky.
- **Čísla:** 1 balenie = 6 ks, 84 € za balenie (14 € za kus). Správne 3 bal = 18 ks = 252 €. Chybne
  18 bal = 108 ks = 1 512 €. Oprava expedície = **45 €** doprava. Konštanty sú exportované zo súboru
  scenára a test `src/data/demo/scenare.test.ts` overuje, že texty rekapitulácií s nimi sedia.
- **Kontrolné body (3):** otvoril produktovú kartu pred zadaním množstva · prepočítal kusy na balenia ·
  skontroloval rekapituláciu množstva a ceny pred potvrdením.
- **Bezchybná cesta (3 rozhodnutia):** otvoriť kartu → zadať 3 bal (číselný vstup so živým prepočtom) →
  potvrdiť rekapituláciu 3 bal / 18 ks / 252 €.
- **Vetvy s následkom:** 18 bal → rekapitulácia 108 ks / 1 512 € (chybu ešte možno zachytiť; potvrdenie
  vedie k expedícii 108 kusov a nákladu 45 €); iná hodnota → spätná väzba s prepočtom. Záver výslovne
  odlišuje náklad na dopravu (45 €) od ceny objednávky a hodnoty vráteného tovaru (90 × 14 € = 1 260 €),
  ktorá nie je strata.

### Scenár 3: Zmena adresy na poslednú chvíľu (`zmena-adresy`)

- **Precvičuje:** dokončenie zmeny objednávky vrátane skladu a prepravných údajov.
- **Podklady:** e-mail oprávnenej kontaktnej osoby (D-1042: dodacia adresa „Sklad B, Logistická 22“,
  fakturačná bez zmeny), hlavička objednávky (dodacia „Sklad A, Priemyselná 10“, vychystaná, štítok
  vytlačený, odvoz 15:00), stav expedície (sklad expeduje podľa štítku), pravidlá firmy.
- **Kontrolné body (4):** overil číslo objednávky a oprávnenú osobu · zastavil expedíciu a zabezpečil
  výmenu štítku s potvrdením skladu · zmenil len dodaciu adresu · potvrdil zákazníkovi až po dokončení.
- **Viac správnych poradí:** ako prvé možno objednávku overiť alebo najprv zastaviť expedíciu – obe
  cesty vedú k bezchybnému záveru (test „viac správnych poradí“).
- **Bezchybná cesta (4 rozhodnutia):** overiť → zastaviť expedíciu → zmeniť len dodaciu adresu a
  vyžiadať výmenu štítku → po potvrdení skladu odpovedať zákazníkovi.
- **Vetvy s následkom:** predčasné „vybavené“ (spätná väzba; nechať na poobede = zásielka odišla,
  **65 €**); len prepísaná hlavička (štítok ostal starý; nechať tak = 65 €); zmena bez zastavenia
  (sklad volá pred odvozom); zmenená aj fakturačná adresa (spätná väzba); štítok bez pokynu skladu;
  nadiktovanie bez overenia; žiadne potvrdenie zákazníkovi (komplikácia bez nákladu).

## 3. Ako scenár upraviť

1. Otvorte súbor scenára v `src/data/demo/` (alebo v klientskom priečinku, pozri `NASADENIE.md`).
2. Texty (`pribeh`, `uloha`, `text` možností, `vysvetlenie`) upravte priamo. Slovenčina s diakritikou,
   vykanie používateľovi.
3. Pri zmene čísel skontrolujte všetky miesta, kde sa číslo opakuje (podklad, rekapitulácia, záver,
   `naklad`). V scenári 2 sú základné čísla v konštantách na začiatku súboru.
4. Pri zmene vetvenia dbajte, aby každá možnosť viedla na existujúci uzol, graf nemal cyklus a každá
   vetva skončila záverom.
5. Zvýšte `verzia` scenára a upravte `schvalenie` (stav, verzia pravidiel, kto a kedy potvrdil).
6. Spustite `npm run validate` a `npm test`. Validácia hlási presne, čo a kde nesedí.
7. Prejdite scenár v prehliadači (`npm run dev`), vrátane chybných vetiev a návratu ku kroku.

## 4. Ako pridať nový scenár

1. Skopírujte najpodobnejší súbor scenára, zmeňte `id` (bez diakritiky, s pomlčkami) a predponu
   identifikátorov uzlov, možností, podkladov a kontrolných bodov (napr. `s4-`).
2. Napíšte zadanie, podklady (vždy aj pravidlá, z ktorých vyplývajú správne rozhodnutia), 2 až 4
   kontrolné body, vstupný uzol, 2 až 4 rozhodovacie kroky na hlavnej ceste, spätné väzby pre chybné
   voľby a aspoň jeden záver `spravne`.
3. Chybné možnosti majú byť uveriteľné skratky. Správne rozhodnutie musí vyplývať z podkladov –
   používateľ nemá hádať skryté pravidlá.
4. Modelový náklad dajte len na možnosť, ktorá naozaj vedie k následku; správny záver nemá byť
   dosiahnuteľný cestou s nákladom (validácia na to upozorní).
5. Pridajte scenár do `scenare` v `index.ts` tréningu.
6. `npm run validate`, `npm test`, prejsť v prehliadači.

## 5. Čo kontroluje validácia (`src/engine/validacia.ts`)

Chyby (blokujú build klientskeho tréningu a zhodia `npm run validate`):

- duplicitné ID uzlov, možností, kontrolných bodov a podkladov;
- neexistujúci vstupný uzol, cieľový uzol možnosti, kontrolný bod v účinkoch alebo podklad;
- rozhodovací uzol bez možností alebo s viac než 4 možnosťami; možnosť bez textu; možnosť vedúca do
  toho istého uzla; záporný náklad;
- číselný vstup bez presne jednej záchytnej možnosti, hodnoty mimo rozsahu alebo priradené viacerým
  možnostiam; hodnoty pri uzle bez číselného vstupu;
- cyklus v grafe; uzol, z ktorého sa nedá dostať k záveru; chýbajúci záver `spravne`;
- kontrolný bod, ktorý žiadna možnosť nesplní;
- neexistencia cesty, na ktorej sú všetky body správne na prvý pokus a končí správnym záverom.

Upozornenia (neblokujú): uzol nedosiahnuteľný zo vstupu, uzol s jedinou možnosťou, kontrolný bod bez
možnosti, ktorá by ho nesplnila, počet kontrolných bodov mimo 2–4, správny záver dosiahnuteľný cestou
s nákladom, ID uzla opakujúce sa vo viacerých scenároch, chýbajúce texty.

Demo prechádza s 0 chybami a 0 upozorneniami (test `src/engine/validacia.test.ts` to vyžaduje).
