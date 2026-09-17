# Pilot a predaj

Pracovný postup pre poskytovateľa: čo predávame, komu, ako vyzerá rozhovor, ako sa vyrába pilot a ako sa
overuje, či má služba dopyt. Nič z toho neposiela správy firmám automaticky – je to plán pre človeka.

## 1. Čo sa predáva

Predáva sa **výroba a odovzdanie tréningu na mieru**. AI je súčasť výrobného postupu, klient kupuje
hotový výsledok. Nepredáva sa licencia, predplatné ani prístup k platforme.

### Balíčky (úvodná ponuka na testovanie, zdroj: `src/config/znacka.ts`)

| Balíček | Rozsah | Cena |
|---|---|---:|
| Platený pilot | 3 situácie pre jednu pozíciu, vstupný rozhovor, jednoduché firemné označenie, jedno súhrnné kolo úprav | 690 € |
| Kompletný tréning | 10 situácií pre jednu pozíciu, firemný vzhľad, dve súhrnné kolá úprav, návod a odovzdanie zdrojov | 1 900 € |
| Rozšírenie | 5 nových situácií v existujúcom tréningu, jedno súhrnné kolo úprav | 490 € |

- Ceny sú návrh na testovanie; na webe sú označené ako úvodná ponuka. Daňový status sa na webe ani
  v podmienkach neuvádza (rozhodnutie 16. 9. 2026), pole `dphPoznamka` ostáva prázdne.
- Jedna situácia = jedna pracovná situácia, 2 až 4 rozhodovacie kroky, 3 až 5 minút. Bez 3D simulácie,
  filmovania a napojenia na firemné systémy.
- Osobitne sa oceňuje: hosting, integrácie (ERP, CRM, HR, LMS), ďalšie jazyky, nové pozície.
- Oprava rozporu so schváleným zadaním je v cene; nový požadovaný obsah je rozšírenie. Toto patrí
  do každej konkrétnej ponuky klientovi.
- Podmienky pilotu pre klienta (čo dostane, čo dodá, postup, platba polovica pri objednávke a polovica
  pri odovzdaní, čo nie je v cene, dôvernosť) sú v `PODMIENKY_PILOTU.md`; PDF na poslanie vyrobí
  `npm run podmienky`. Do konkrétnej ponuky sa dopĺňa už len pozícia, termín a platobné údaje.
- Odhad dodania pilotu: 7 až 10 pracovných dní od dodania úplných podkladov; pri prvej zákazke sa
  termín potvrdí individuálne podľa skúsenosti s výrobou dema. Nikde nesľubovať dodanie za pár minút.

### Čo sleduje kalkulácia

Tržba nie je zisk. Do nákladov pilotu patrí čas poskytovateľa (predajný rozhovor, dopĺňanie podkladov,
výroba, kontrola, úpravy, odovzdanie), používané AI nástroje a prípadný hosting. Po prvom pilote
zapísať skutočné hodiny a porovnať s cenou.

## 2. Prvý typ klienta

Slovenské veľkoobchody a predajné firmy, kde pracovníci prijímajú objednávky, pripravujú ponuky
a komunikujú termíny dodania. Vhodná firma:

- má viac ľudí na podobnej pozícii a opakovane niekoho zaškoľuje,
- vedúci opakovane vysvetľuje rovnaké postupy,
- pozná konkrétne omyly a vie opísať správny postup,
- chyba má viditeľný dôsledok (opakovaná doprava, prerábanie objednávky, zdržanie, zásah vedúceho),
- má človeka, ktorý obsah skontroluje a schváli.

Kupujúci: majiteľ, vedúci predaja alebo prevádzkový vedúci. Používateľ: nový alebo existujúci pracovník.
Mimo rozsahu tejto verzie: certifikované školenia, obsluha nebezpečných zariadení, odborné právne
či zdravotné rozhodnutia.

## 3. Rozhovor: zistiť, či má pilot zmysel (fáza A)

Najprv problém, až potom ukážka. Otázky:

1. Akú pracovnú pozíciu má tréning pokryť?
2. Koho firma zaškoľuje a ako často?
3. Ktoré tri chyby sa opakujú?
4. Ako sa chyba odhalí a čo potom musí niekto opraviť?
5. Kto vie potvrdiť správny postup?

Potom ukázať **relevantnú časť dema** (situácia, ktorá je najbližšie ich chybe – napr. Sľúbený termín pri
problémoch s dostupnosťou, Kusy alebo balenia pri chybách v jednotkách, Zmena adresy pri logistike).
Nechať vedúceho prejsť jednu situáciu sám. Na konci ponúknuť pilot s presným rozsahom a cenou.

## 4. Získať podklady (fáza B)

- Vyžiadať anonymizované príklady e-mailov, objednávok alebo formulárov. Zachovať jednotky, stavy
  a pravidlá; nepotrebné osobné údaje nahradiť modelovými.
- Rozhovor môže byť podkladom na zápis. Nahrávku používať len po dohodnutí s účastníkmi.
- Nevyžadovať prílohy s osobnými údajmi zamestnancov.

## 5. Pripraviť a schváliť scenáre (fáza C)

Ku každej situácii zapísať:

1. úlohu pracovníka a dostupné informácie,
2. správne postupy a prípustné alternatívy,
3. typické chyby a ich doložené následky,
4. chýbajúce údaje, ktoré musí klient doplniť,
5. konkrétne kontrolné body tréningu (2 až 4).

Návrh scenára pripraví AI podľa `SABLONA_SCENARA.md`. **Klient schvaľuje obsah pred finálnym
spracovaním.** AI nesmie dopĺňať neznáme firemné pravidlá ako hotové fakty; každý kontrolný bod má
uvedený zdroj pravidla. Schválenie sa zapíše do `schvalenie` v dátach scenára (stav, verzia
pravidiel, referencia na podklad, kto a kedy potvrdil).

## 6. Vytvoriť a preveriť produkt (fáza D)

- Založiť klientsky tréning podľa `NASADENIE.md` (priečinok mimo repozitára), vložiť scenáre.
- `npm run validate` na klientskom priečinku, `npm test`, prejsť všetky vetvy v prehliadači,
  skontrolovať výpočty a sumy.
- Zodpovedný človek klienta prejde obsahovú kontrolu aj reálnu ukážku (klikne si celý tréning).

## 7. Odovzdať a zistiť výsledok (fáza E)

Odovzdať: build tréningu, zdrojové súbory scenárov, dátum a verziu scenárov, prehľad scenárov, návod na
používanie a úpravy, zoznam schválených pravidiel. Dohodnúť použitie na malej skupine pracovníkov
a krátke vyhodnotenie o 2–4 týždne. Nové prípady alebo zmenené pravidlá = rozšírenie.

## 8. Plán prvých desiatich rozhovorov

Cieľ: **jedna zaplatená objednávka pilotu** a overenie, či firma tréning naozaj použije.

| # | Firma | Kontakt (rola) | Dátum | Opakuje sa problém? | Rozpočet a právomoc | Dodá podklady a schvaľovateľa? | Reakcia na cenu | Dôvod odmietnutia / odkladu | Objednávka a platba |
|---|---|---|---|---|---|---|---|---|---|
| 1 | | | | | | | | | |
| 2 | | | | | | | | | |
| … | | | | | | | | | |
| 10 | | | | | | | | | |

Zaznamenávať pri každom rozhovore:

- či sa problém vo firme naozaj opakuje,
- kto má rozpočet a právomoc objednať pilot,
- či firma dodá podklady a človeka na kontrolu,
- reakciu na cenu a hlavný dôvod odmietnutia alebo odkladu,
- skutočnú objednávku a platbu **oddelene od pochvaly nápadu**.

Rozhodovací bod: jedna zaplatená objednávka. Potom overiť, či bol tréning použitý, či sú situácie
zrozumiteľné a či firma chce pokračovať.

Ak vhodné firmy po desiatich rozhovoroch pilot neobjednajú: zhrnúť konkrétne dôvody a upraviť
cieľovú skupinu, rozsah alebo ponuku **pred** ďalšou investíciou do funkcií.

## 9. Čo merať pri prvom pilote

- čas výroby (hodiny poskytovateľa po fázach A–E),
- čas vedúceho klienta pri príprave a schvaľovaní,
- skúsenosť pracovníkov (zrozumiteľnosť, čo im pomohlo, kde sa zasekli),
- či sa tréning používa pri zaškoľovaní aj po odovzdaní.

Z malej vzorky nerobiť všeobecné tvrdenia o znížení chybovosti. Ak sa meria výkon pred tréningom
a po ňom, použiť podobné, ale nie totožné úlohy a výsledok opísať s jeho obmedzeniami. Na web
neuvádzať referencie, logá, počty používateľov ani percentá úspory, kým neexistujú a klient s tým
nesúhlasí.
