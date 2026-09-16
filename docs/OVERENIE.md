# Overenie

Skutočne vykonané kontroly prvej verzie (16. 9. 2026, Windows 11, Node 26.3.0, npm 11.16.0).

## Automatické kontroly

| Kontrola | Príkaz | Výsledok |
|---|---|---|
| Typy | `npm run typecheck` (TypeScript 5.9.3, strict, `noUncheckedIndexedAccess`) | bez chýb |
| Validácia scenárov | `npm run validate` | 3 scenáre, 0 chýb, 0 upozornení |
| Jednotkové testy | `npm test` (Vitest 5.0.1) | 5 súborov, 59 testov, všetky prešli |
| Produkčný build | `npm run build` (Vite 8.3.0) | `dist/`: index.html 1,2 kB, CSS 15,8 kB, JS 314,7 kB (gzip 94,9 kB) |
| Koncový test | `npm run test:e2e` (Playwright 1.63.0, Chromium headless) | 3 testy, všetky prešli |

### Čo jednotkové testy overujú

- **Engine pokusu** (`src/engine/pokus.test.ts`): čistý štart; odmietnutie neznámej možnosti a rozhodnutia
  po závere; správna cesta = všetko správne na prvý pokus bez nákladu; oprava po spätnej väzbe =
  „opravené“; chybný záver má náklad len na svojej vetve a nedotknuté body sú nevyriešené; návrat ku
  kroku odstráni nasledujúcu vetvu vrátane nákladov a stavov bodov; náklad sa po návrate a novom
  výbere nezdvojí; nový pokus začína odznova; číselný vstup (3 → správna rekapitulácia, 18 → 108 kusov,
  iné → záchytná možnosť, mimo rozsahu → chyba).
- **Validácia** (`src/engine/validacia.test.ts`): demo prechádza bez chýb a upozornení; odhalenie
  neexistujúceho cieľa, duplicitných ID, cyklu, uzla bez možností, chýbajúcej bezchybnej cesty,
  nesplniteľného kontrolného bodu, neexistujúceho bodu v účinkoch, neexistujúceho podkladu, číselného
  vstupu bez záchytnej možnosti, hodnôt bez vstupu, záporného nákladu, viac než 4 možností;
  upozornenia na nedosiahnuteľný uzol a správny záver s nákladom.
- **Dáta dema** (`src/data/demo/scenare.test.ts`): každá cesta každého scenára sa dá dokončiť; bezchybná
  cesta má 2 až 4 rozhodnutia; modelový náklad je len na vetvách s chybným záverom a správny záver
  je bez nákladu; chybný záver nikdy nemá všetky body správne; náklady v dátach sú presne 120 €, 45 €,
  65 €; výpočty scenára 2 (18 ÷ 6 = 3, 3 × 84 = 252, 18 × 6 = 108, 18 × 84 = 1 512, 84 ÷ 6 = 14)
  a zhoda textov rekapitulácií s nimi; záver rozlišuje náklad na dopravu od ceny objednávky; scenár 3
  uznáva obe poradia (overiť / zastaviť); prepísanie hlavičky bez štítku nevedie k správnemu záveru;
  prísľub bez kontroly vedie do spätnej väzby a expres stojí 120 €.
- **Dopyt** (`src/web/dopyt_text.test.ts`): validácia polí, text dopytu so všetkými údajmi a balíčkom,
  `mailto:` odkaz s korektne zakódovaným predmetom a telom (diakritika, nové riadky, bez `+`).
- **Router** (`src/router.test.ts`): prázdny hash, kotvy sekcií, cesty dema s parametrami.

### Čo overuje koncový test (`e2e/demo.spec.ts`)

1. Web: H1, poznámka „Bez registrácie…“, ceny 690 / 1 900 / 490 €, na stránke nie je „zadarmo“ ani
   „referencie“. Náhľad situácie: chybná voľba ukáže následok, odkaz otvorí demo s už zvoleným prvým
   krokom (`?prva=`), zobrazí sa spätná väzba a „Rozhodnutie č. 2“.
2. Oprava po spätnej väzbe → správna cesta → súhrn „Zvládnuté po oprave“ s bodom „opravené po spätnej
   väzbe“, bez modelového nákladu, s tlačidlom tlače.
3. Návrat k rozhodnutiu č. 1 odstráni celú vetvu; správna cesta končí „Zvládnuté“ so 4 bodmi
   správne na prvý pokus.
4. Situácia 2: číselný vstup 18 → živý prepočet „18 bal = 108 ks · 1 512 €“ → potvrdenie → „Chyba
   s následkom“ s „Modelový následok tejto vetvy: 45 €“; „Skúsiť scenár znova“ dá čistý stav
   s oddeleným „Predchádzajúci pokus“; hodnota 0 sa odmietne hláškou; 3 → „Zvládnuté“.
5. Prehľad tréningu ukazuje výsledky a jednu nedokončenú situáciu.
6. Dopyt: pripraví text s údajmi, nadpis „Dopyt je pripravený. Odošlite ho zo svojho e-mailu.“,
   na stránke nie je „Dopyt bol odoslaný“; prázdny formulár nahlási chyby pri poliach.
7. Mobil 360 × 740 px: web, prehľad situácií a scenár bez vodorovného pretekania; podklady sú za
   prepínačom, záložky fungujú, po otvorení stále bez pretekania.
8. Klávesnica: možnosť sa zvolí Tabom a Enterom, fokus prejde na nadpis nového uzla, Tab pokračuje na
   tlačidlo.
9. Počas celého behu žiadna chyba v konzole ani chyba stránky (`pageerror`).

## Redizajn predajného webu (16. 9. 2026, druhé kolo)

Po prestavbe webu (nové písmo a ikony ako lokálne balíky, plávajúca hlavička, hero s ukážkou, bento,
cena s odporúčaným balíkom) prebehli všetky automatické kontroly znova s rovnakým výsledkom: typy bez
chýb, 59 jednotkových testov, validácia 0/0, build (CSS 30,7 kB, JS 400,1 kB vrátane ikon a písma
v troch podmnožinách), 3 koncové testy. Navyše:

- Sonda pretekania na 360 px (`getBoundingClientRect` každého prvku) odhalila dekoratívny kruh
  veľkej dlaždice bento, ktorý presahoval o 43 px; opravené (`overflow: hidden`), šírka dokumentu = 360.
- Hlavička na mobile: značka sa orezávala tlačidlom; tlačidlo má na úzkych obrazovkách krátky štítok
  („Ukážka“) a prístupný názov ostáva „Vyskúšať ukážku“.
- Kontrola textov webu: žiadne pomlčky ako dekorácia, žiadne „zadarmo“, žiadne referencie ani
  vymyslené čísla; čísla v dlaždici (12 / 9 / 3) sú z dát prvej situácie.
- Snímky sa robia s `reducedMotion: 'reduce'`, aby celostránkový záber ukázal konečný stav sekcií
  (odhaľovanie pri skrolovaní inak necháva spodné sekcie v počiatočnom stave).

## Ručné kontroly

- Snímky obrazovky `node scripts/nahlady.mjs` (Chromium headless, 1280 px a 360 px, tlač):
  predajný web, prehľad situácií, scenár 1 na začiatku a po chybnej voľbe, číselný vstup scenára 2,
  súhrn s chybou, mobilný web, mobilný scenár s otvorenými podkladmi, tlačový režim súhrnu, pripravený
  dopyt. Skript zároveň meria šírku dokumentu – bez pretekania, bez chýb v konzole.
- Vizuálne skontrolované z náhľadov: hlavička a navigácia na desktope, hero, náhľad situácie
  s e-mailom a skladom vedľa seba, možnosti A/B, prehrávač s podkladmi v pravom stĺpci (na mobile
  pod prepínačom, otvorená záložka dôležitá pre krok), súhrn s verdiktom, kontrolnými bodmi, cestou
  rozhodnutí a tlačidlami, tlačový režim bez hlavičky, pätičky a tlačidiel.
- Text stránky a titulky skontrolované v náhľade buildu (`npm run preview`); vizuálne dôkazy sú
  zo snímok z Playwrightu.

## Známe obmedzenia

- **Stav len v pamäti stránky.** Obnovenie stránky alebo zavretie karty začne odznova (demo to hovorí
  pri štarte). Zámer: nič sa neukladá ani neposiela.
- **Dopyt bez backendu.** Kým nie je nastavený `kontaktEmail`, formulár len pripraví text na
  skopírovanie a hovorí, že adresa sa doplní pred publikovaním. `mailto:` funguje len ľuďom
  s nastaveným e-mailovým programom, preto je hlavná cesta kopírovanie.
- **Prehliadače:** overené v Chromiu (Playwright). Firefox a Safari neboli testované; kód nepoužíva nič
  neštandardné (CSS grid, `useSyncExternalStore`, `navigator.clipboard` so záložným výberom textu).
- **Playwright používa existujúci build Chromia** z priečinka `ms-playwright` (na stroji nie je Chrome
  a predvolená verzia pre Playwright 1.63 nie je stiahnutá). `playwright.config.ts` ho nájde sám;
  po `npx playwright install chromium` by použil predvolenú verziu.
- **Kontrast a čitateľnosť** boli nastavené podľa zvolených farieb (tmavomodrý text na svetlom pozadí,
  zelenomodrý akcent), automatický audit prístupnosti (napr. axe) sa nespúšťal. Stavy sú vždy
  označené znakom a textom, nie iba farbou; fokus je viditeľný; pohyb rešpektuje `prefers-reduced-motion`.
- **Doména, e-mail, DPH, fakturačné údaje** nie sú nastavené (zoznam v `NASADENIE.md`). Lokálne demo
  a web fungujú aj bez nich.
