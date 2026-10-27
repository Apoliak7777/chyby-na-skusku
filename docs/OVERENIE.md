# Overenie

Skutočne vykonané kontroly po prerábke predajného webu a ukážky a po pridaní pohybu (26. 10. 2026, Windows 11, Node 26.3.0, npm 11.16.0).

## Automatické kontroly

| Kontrola | Príkaz | Výsledok |
|---|---|---|
| Typy | `npm run typecheck` (TypeScript 5.9, strict) | bez chýb |
| Validácia scenárov | `npm run validate` | 3 scenáre, 0 chýb, 0 upozornení |
| Jednotkové testy | `npm test` (Vitest 5) | 10 súborov, 112 testov, všetky prešli |
| Produkčný build | `npm run build` (Vite 8) | `dist/`: index.html 5,0 kB, CSS 50 kB (gzip 10,5 kB), JS 410 kB (gzip 118 kB) |
| Koncové testy | `npm run test:e2e` (build + Playwright, Chromium headless, bez pohybu) | 24 testov, všetky prešli; tie isté testy so zapnutým pohybom tiež 24 z 24 |
| Výkon s pohybom | mobil 390 px, CPU 4×, sieť 1,6 Mb/s, bez cache | CLS 0, LCP okolo 2,1 s s pohybom aj bez neho |
| Klientsky build | `npm run build:klient -- <kópia dema s rezim 'klient'>` | prešiel aj s kontrolou výstupu: noindex, titulok tréningu, v JS ani v súboroch nič z predajného webu |
| Podmienky v PDF | `npm run podmienky` | jedna strana A4 |

### Čo jednotkové testy overujú

- **Engine pokusu** (`src/engine/pokus.test.ts`): štart, vyhodnotenie, návrat ku kroku bez zdvojenia nákladov, číselný vstup.
- **Validácia** (`src/engine/validacia.test.ts`): chyby a upozornenia dátového modelu vrátane typickej chyby a reťaze následkov.
- **Dáta ukážky** (`src/data/demo/scenare.test.ts`): každá cesta sa dá dokončiť, náklady len na chybných vetvách, výpočty scenára 2,
  možnosti bez sumy a zdôvodnenia, závery netvrdia kroky, ktoré návštevník neurobil, texty z hero ostali.
- **Sadzba** (`src/engine/sadzba.test.ts`, `src/web/sadzba.test.ts`): jednopísmenové predložky, „s. r. o.“, dátumy, čísla s jednotkou, kódy.
- **Dopyt a kontakt** (`src/web/dopyt_text.test.ts`): validácia jednej vety, text e-mailu, ceny, `mailto:` s CRLF a diakritikou, odkaz pre vedúceho.
- **Živá ukážka v hero** (`src/web/mini_nahlad.test.ts`): čísla zhodné so skladovým prehľadom situácie 1, odkazy na existujúce možnosti.
- **JSON-LD** (`src/jsonld.test.ts`): ceny ponúk v `index.html` sedia s `src/config/znacka.ts`, bez hodnotení.
- **Router** (`src/router.test.ts`): kotvy, cesty ukážky, neplatné kódovanie v adrese nezhodí stránku.
- **Pohyb** (`src/pohyb.test.ts`): kedy sa pohyb zapne, odhalenie raz, séria s obmedzeným poradím, prvok nad oknom alebo pod hlavičkou nečaká, fokus odhalí hneď, bez IntersectionObserver je všetko viditeľné.

### Čo overujú koncové testy

- `e2e/web.spec.ts`: nadpis a titulok, pravidlá obsahu (nič zadarmo, nič „odoslané“, bez dekoratívnych pomlčiek), živá ukážka
  v hero (rezervácie až po voľbe, fokus, stabilná poloha), tri chyby vedú do svojich situácií, snímky sa načítajú, kontakt
  (`mailto:`, skopírovanie adresy, krátky formulár bez predstieraného odoslania), podmienky, ochrana údajov, pás z mailu, skip link
  v ukážke, krátka stránka bez pásu pod pätičkou, mobil 360, 390 a 414 px bez pretekania.
- `e2e/demo.spec.ts`: chybná voľba z hero, spätná väzba, oprava, súhrn s blokom pre majiteľa a typickou chybou, návrat ku kroku,
  číselný vstup, „Čo uvidí vedúci“ (výzva až po dokončenej situácii, tlač na A4), voľba z adresy po rozpracovanom pokuse,
  klávesnica, mobil 360 a 390 px (prvá voľba na prvej obrazovke, nadpisy nie pod hlavičkou), bez chýb konzoly.

## Ručné kontroly

- Snímky celej stránky a ukážky pri šírkach 360, 390, 414, 768, 1366 a 1920 px, tlač súhrnu a prehľadu.
- Pohyb: snímky v časových bodoch animácií (hero, živá ukážka, scroll, pečiatka verdiktu), bez JS, pri tlači a pri reduced motion nič skryté, rýchly scroll tam a späť nič nenechá skryté, pod hlavičkou po prechode do ukážky žiadne zvyšky textu.
- Nezávislá kontrola vizuálu, textov, kódu a čistoty repa; nálezy opravené okrem rozhodnutí, ktoré patria poskytovateľovi
  (meno, IČO, telefón, platobné podmienky, cena prevádzky tréningu).

## Známe obmedzenia

- Meno, telefón, IČO a sídlo poskytovateľa sú prázdne (`src/config/znacka.ts`), web ich preto nikde neukazuje.
- Dopyt sa posiela z e-mailu návštevníka. Na počítači s webovou poštou nemusí `mailto:` nič otvoriť; vedľa je preto skopírovanie adresy.
- Web nemeria návštevnosť ani konverzie.
- Stav ukážky je len v pamäti stránky, po obnovení začína odznova.
