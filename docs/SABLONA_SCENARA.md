# Šablóna zadania pre AI pri výrobe scenára

Opakovateľné zadanie, ktoré sa použije pri každom klientovi. Zástupné polia `[DOPLNIŤ]` sú
zámerné – vypĺňajú sa z podkladov konkrétnej firmy. Výstup AI je **návrh čakajúci na obsahové
schválenie klientom**, nikdy nie hotový obsah.

## Šablóna (skopírovať a vyplniť)

```text
Priprav návrh interaktívneho tréningového scenára podľa dodaných podkladov.

Pracovná pozícia:
[DOPLNIŤ]

Úloha pracovníka a opis skutočného prípadu:
[DOPLNIŤ]

Firemné pravidlá a zdroje:
[DOPLNIŤ]

Typické chyby a doložené následky:
[DOPLNIŤ]

Vytvor jednu situáciu s 2 až 4 rozhodovacími krokmi.
Uveď zadanie, podklady, možnosti, nasledujúce uzly, následky a vysvetlenia.
Správne rozhodnutia odvoď iba z dodaných pravidiel.
Ak údaje chýbajú, vypíš otázky a označ dotknutú časť ako neúplnú.
Nevymýšľaj finančné následky ani interné oprávnenia pracovníka.
Uznaj všetky prípustné postupy doložené podkladmi.
Ku každému kontrolnému bodu pripoj zdroj pravidla.
Priprav kontrolný prehľad pre klienta pred implementáciou.
Text píš po slovensky, zrozumiteľne a vecne.
Výstup je návrh čakajúci na obsahové schválenie klientom.
```

## Ako šablónu použiť

1. **Vyplniť polia z podkladov klienta** (rozhovor, anonymizované e-maily, objednávky, formuláre,
   spísané pravidlá). Do „Firemné pravidlá a zdroje“ vložiť pravidlá doslovne a uviesť, odkiaľ sú
   (dokument, meno schvaľovateľa, dátum). Do „Typické chyby a doložené následky“ len následky, ktoré
   firma sama potvrdila (napr. „opakovaná doprava stála 65 €“ – ak sumu nepozná, nechať bez sumy).
2. **Nechať AI pripraviť návrh.** Výstup má obsahovať: zadanie, podklady, 2 až 4 kontrolné body so
   zdrojom pravidla, uzly s možnosťami, následky, vysvetlenia záverov a zoznam otázok na chýbajúce údaje.
3. **Kontrolný prehľad pre klienta** – pred implementáciou dať schvaľovateľovi tabuľku: situácia,
   správny postup, prípustné alternatívy, chybné voľby a ich následky, kontrolné body, zdroj pravidla,
   otvorené otázky. Klient označí, čo platí, čo nie a čo doplní.
4. **Až po schválení** prepísať návrh do dátového modelu (`docs/SCENARE.md`, kapitola 3 a 4):
   zadanie → `zadanie`, podklady → `podklady` (vždy aj pravidlá), kontrolné body → `kontrolneBody`
   so `zdrojPravidla`, uzly → `uzly`, následky → `nasledok` / `naklad` / záverečné uzly. Do
   `schvalenie` zapísať stav `schvalene`, verziu pravidiel, referenciu na podklad, kto a kedy potvrdil.
5. **Validácia a prejdenie:** `npm run validate <priečinok>`, `npm test`, prejsť všetky vetvy v prehliadači,
   skontrolovať výpočty. Potom obsahová kontrola aj reálna ukážka u klienta.

## Čo AI nesmie

- dopĺňať neznáme firemné pravidlá ako hotové fakty,
- vymýšľať sumy následkov, oprávnenia pracovníka alebo interné postupy,
- označiť za správne niečo, čo z dodaných pravidiel nevyplýva,
- vyžadovať jedno presné poradie krokov tam, kde firemné pravidlá pripúšťajú viaceré.

## Kontrolný zoznam pred implementáciou

- [ ] Každý kontrolný bod má zdroj pravidla, ktorý klient pozná.
- [ ] Správne rozhodnutie vyplýva z podkladov, ktoré používateľ v tréningu uvidí.
- [ ] Chybné možnosti sú uveriteľné skratky z praxe, nie karikatúry.
- [ ] Každá chybná vetva má viditeľný následok a cestu k oprave alebo záver.
- [ ] Sumy sú len tie, ktoré klient doložil; sú označené ako modelové a viazané na konkrétnu vetvu.
- [ ] Otvorené otázky sú vypísané a dotknuté časti označené ako neúplné.
- [ ] Návrh schválil menovaný človek klienta (meno, dátum, verzia pravidiel).
