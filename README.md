# Chyby na skúšku

Služba, ktorá firme vyrobí interaktívny tréning z jej vlastných opakujúcich sa pracovných chýb.
Tento projekt je jej **prvá funkčná verzia** (16. 9. 2026):

1. **Predajný web** – ponuka, rozsah, ceny (úvodná ponuka), časté otázky a príprava dopytu.
2. **Verejné hrateľné demo** – tri úplné situácie vymyslenej firmy DEMO DISTRIBÚCIA, bez registrácie.
3. **Základ výroby** – scenáre ako dáta oddelené od aplikácie, validácia, návod a šablóna pre ďalších klientov.

Projekt vznikol podľa interného zadania z 15. 9. 2026.

## Rýchly štart

Potrebujete Node.js 20 alebo novší (overené s Node 26.3.0 a npm 11.16.0 na Windows 11).

```bash
npm install
npm run dev
```

Vývojový server beží na `http://localhost:5177`. Produkčný build a jeho náhľad:

```bash
npm run build
npm run preview
```

Náhľad buildu beží na `http://localhost:4177`.

## Nasadenie

Každý push do vetvy `main` spustí workflow `.github/workflows/pages.yml` (validácia, testy, build)
a nasadí `dist/` na GitHub Pages: `https://apoliak7777.github.io/chyby-na-skusku/`. Pripojenie vlastnej
domény a zoznam údajov, ktoré treba pred ostrou prevádzkou doplniť, je v `docs/NASADENIE.md`.

## Príkazy

| Príkaz | Čo robí |
|---|---|
| `npm run dev` | vývojový server s okamžitým prekreslením |
| `npm run build` | kontrola typov + produkčný build do `dist/` |
| `npm run preview` | statický náhľad `dist/` |
| `npm run typecheck` | TypeScript bez emitovania |
| `npm run validate` | validácia scenárov dema (väzby, dosiahnuteľné konce, bez cyklov, kontrolné body, bezchybná cesta) |
| `npm test` | jednotkové testy (engine pokusu, validácia, výpočty scenárov, dopyt, router) |
| `npm run test:e2e` | koncový test v Chromiu nad `dist/` (spustite po `npm run build`) |
| `npm run check` | typy + validácia + testy + build naraz |
| `npm run build:klient -- treningy_klientov/<firma>` | samostatný klientsky tréning (pozri `docs/NASADENIE.md`) |
| `node scripts/nahlady.mjs` | snímky obrazovky webu a dema do `nahlady/` (pri bežiacom `npm run preview`) |

Koncový test a snímky používajú Chromium, ktoré je na stroji už stiahnuté pre Playwright
(`playwright.config.ts` ho nájde sám; inou cestou ho vnútite premennou `CHROMIUM_EXE`).

## Adresy v aplikácii

Aplikácia používa hash adresy, takže funguje z ľubovoľného podpriečinka statického hostingu.

| Adresa | Obsah |
|---|---|
| `/#/` | predajný web (`#situacia`, `#ukazka`, `#ako`, `#co-dostanete`, `#cennik`, `#otazky`, `#dopyt` sú kotvy sekcií) |
| `/#/demo` | prehľad troch situácií a stav pokusov |
| `/#/demo/slubeny-termin` | situácia 1 – Sľúbený termín |
| `/#/demo/kusy-alebo-balenia` | situácia 2 – Kusy alebo balenia |
| `/#/demo/zmena-adresy` | situácia 3 – Zmena adresy na poslednú chvíľu |
| `/#/demo/prehlad` | prehľad tréningu na tlač alebo uloženie do PDF |

## Štruktúra

```
index.html                  vstupná stránka (lang="sk")
src/main.tsx                štart Reactu
src/App.tsx                 hash router, rozloženie, hlavička a pätička
src/router.ts               parsovanie hash adries
src/config/znacka.ts        názov služby, poskytovateľ, kontakt, balíčky a ceny, čo je mimo ceny
src/data/types.ts           dátový model (tréning, scenár, uzol, možnosť, kontrolný bod, schválenie)
src/data/demo/              verejné demo: index.ts + tri scenáre + test výpočtov
src/engine/pokus.ts         stav pokusu (výber, číselný vstup, návrat ku kroku) a vyhodnotenie
src/engine/validacia.ts     automatická validácia scenárov
src/demo/                   prehrávač: stav v pamäti, uzly, podklady, súhrn, prehľad tréningu
src/web/                    predajný web, funkčný náhľad situácie, dopyt
src/styles.css              jeden štýl pre web aj demo (svetlé pozadie, tmavomodrý text, jeden akcent, tlač)
scripts/validuj_scenare.ts  validácia z príkazového riadka
scripts/build_klient.mjs    build klientskeho tréningu z priečinka mimo repozitára
scripts/nahlady.mjs         snímky obrazovky
e2e/demo.spec.ts            koncový test (web → demo → chybná vetva → oprava → súhrn → návrat → nový pokus → prehľad → dopyt; mobil 360 px; klávesnica)
docs/                       dokumentácia (nižšie)
```

## Dokumentácia

- [docs/SCENARE.md](docs/SCENARE.md) – dátový model, pravidlá troch scenárov, ako scenár upraviť alebo pridať, čo kontroluje validácia.
- [docs/PILOT_A_PREDAJ.md](docs/PILOT_A_PREDAJ.md) – balíčky a rozsah, otázky na rozhovor, plán prvých desiatich rozhovorov, čo zaznamenávať.
- [docs/SABLONA_SCENARA.md](docs/SABLONA_SCENARA.md) – opakovateľné zadanie pre AI pri spracovaní podkladov klienta.
- [docs/NASADENIE.md](docs/NASADENIE.md) – publikovanie verejného dema, čo doplniť pred publikovaním, oddelenie interných klientskych tréningov.
- [docs/OVERENIE.md](docs/OVERENIE.md) – vykonané kontroly, výsledky a známe obmedzenia.

## Rozhodnutia a predpoklady

- **Stack:** React 19, TypeScript 5.9, Vite 8 (statický výstup), Vitest 5, Playwright 1.63. Router je ~40 riadkov, stav je obyčajný React context.
- **Vzhľad (redizajn 16. 9. 2026):** písmo Plus Jakarta Sans hostované lokálne z balíka `@fontsource-variable/plus-jakarta-sans` (podmnožina latin-ext pre slovenčinu, žiadne požiadavky na cudzie servery), ikony `@phosphor-icons/react`, plávajúca hlavička, dvojité rámy (`.bezel` + `.bezel__jadro`), tlačidlá ako pilulky s ikonou v krúžku, tiene tónované do modrej, jeden akcent. Pohyb len cez `transform` a `opacity`: vstup hera pri načítaní a odhaľovanie sekcií cez CSS `animation-timeline: view()` (kde prehliadač nevie, obsah je statický); pri `prefers-reduced-motion` je všetko vypnuté.
- **Štruktúra predajného webu:** hero s textom vľavo a živou ukážkou vpravo (skutočný kus produktu, nie obrázok), výrok „Poznáte to?“, tri kroky, bento troch situácií, štyri výhody, cena s jedným odporúčaným balíkom (pilot) a dvoma riadkami ďalších, osem otázok v dvoch stĺpcoch, dopyt s vysvetlením, čo sa stane potom. Texty sú krátke a bez odborných výrazov; jedno tlačidlo na jeden zámer („Vyskúšať ukážku“, „Chcem pilot za 690 €“).
- **Stav pokusu je len v pamäti stránky.** Obnovenie stránky začne odznova; demo to hovorí pri štarte. Nič sa neukladá ani neposiela, meno pracovníka sa nežiada.
- **Scenáre sú dáta.** Každý scenár je jeden súbor v `src/data/demo/`, graf uzlov je acyklický; opakovanie a návrat ku kroku sú funkcie rozhrania, nie vetvy príbehu.
- **Kontrolné body** majú tri stavy: správne na prvý pokus, opravené po spätnej väzbe, nevyriešené. Nedotknutý bod je po skončení nevyriešený.
- **Modelové sumy** (120 €, 45 €, 65 €) sú viazané na konkrétne možnosti a zobrazujú sa len na vetve, ktorá k nim vedie. Návrat ku kroku ich odstráni, nič sa nezdvojí (testy `src/engine/pokus.test.ts`).
- **Dopyt bez backendu.** Formulár pripraví text a ponúkne skopírovanie. Tlačidlo „Otvoriť e-mail s dopytom“ a viditeľná adresa sa ukážu až po nastavení `kontaktEmail` v `src/config/znacka.ts`. Stránka nikdy nehlási „odoslané“.
- **Ceny** sú na webe označené ako úvodná cena a uvádzajú sa len ako sumy. Daňový status sa na webe neuvádza (`dphPoznamka` ostáva prázdna).
- **Žiadne cudzie skripty, písma, cookies ani sledovanie.** Písmo je systémové (Segoe UI / system-ui).
- **Na webe nie sú referencie, logá zákazníkov, počty používateľov ani percentá úspory** – nič také zatiaľ neexistuje.

## Čo ešte chýba

Web beží na `https://chybynaskusku.online`. Zoznam s miestami v kóde je v `docs/NASADENIE.md`.

- kontaktný e-mail na dopyty (`znacka.kontaktEmail`), kým nie je, formulár dopyt len pripraví na skopírovanie,
- stránka ochrany osobných údajov (po doplnení e-mailu).

Meno prevádzkovateľa ani daňový status sa na webe zámerne neuvádzajú (`poskytovatel` a `dphPoznamka` ostávajú prázdne).
