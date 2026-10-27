# Chyby na skúšku

Služba, ktorá firme vyrobí interaktívny tréning z jej vlastných opakujúcich sa pracovných chýb.
Projekt obsahuje tri časti:

1. **Predajný web:** ponuka, rozsah, ceny, časté otázky, kontakt a príprava dopytu.
2. **Verejná hrateľná ukážka:** tri úplné situácie vymyslenej firmy DEMO DISTRIBÚCIA, bez registrácie.
3. **Základ výroby:** scenáre ako dáta oddelené od aplikácie, validácia a samostatný build klientskeho tréningu.

Interné postupy výroby a predaja nie sú súčasťou tohto repozitára.

## Rýchly štart

Potrebujete Node.js 22.12 alebo novší (overené s Node 26.3.0 a npm 11.16.0 na Windows 11).

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
a nasadí `dist/` na GitHub Pages s vlastnou doménou `https://chybynaskusku.online`. Podrobnosti
a oddelenie klientskych tréningov sú v `docs/NASADENIE.md`.

## Príkazy

| Príkaz | Čo robí |
|---|---|
| `npm run dev` | vývojový server s okamžitým prekreslením |
| `npm run build` | kontrola typov a produkčný build do `dist/` |
| `npm run preview` | statický náhľad `dist/` |
| `npm run typecheck` | TypeScript bez emitovania |
| `npm run validate` | validácia scenárov ukážky (väzby, dosiahnuteľné konce, bez cyklov, kontrolné body, bezchybná cesta) |
| `npm test` | jednotkové testy (engine pokusu, validácia, výpočty scenárov, dopyt, mini náhľad v hero, router, ceny v JSON-LD) |
| `npm run test:e2e` | čerstvý build a koncový test v Chromiu nad `dist/` |
| `npm run check` | typy, validácia, testy a build naraz |
| `npm run build:klient -- treningy_klientov/<firma>` | samostatný klientsky tréning (pozri `docs/NASADENIE.md`) |
| `npm run podmienky` | podmienky pilotu z `docs/PODMIENKY_PILOTU.md` do `vystupy/Podmienky_pilotu.pdf` (jedna strana A4 na poslanie klientovi) |
| `npm run ikony` | z `public/favicon.svg` vyrobí `favicon.ico` a `apple-touch-icon.png` (po každej zmene loga) |
| `npm run og` | obrázok náhľadu odkazu `public/og.png` z hero úvodnej stránky (pri bežiacom `npm run preview`, postup v `docs/NASADENIE.md`) |
| `node scripts/snimky_webu.mjs` | snímky ukážky pre sekciu „Čo dostanete“ do `public/img/` (pri bežiacom `npm run preview`) |

Koncový test a skripty so snímkami používajú Chromium, ktoré je na stroji už stiahnuté pre Playwright
(`playwright.config.ts` ho nájde sám; inou cestou ho vnútite premennou `CHROMIUM_EXE`).

## Adresy v aplikácii

Aplikácia používa hash adresy, takže funguje z ľubovoľného podpriečinka statického hostingu.

| Adresa | Obsah |
|---|---|
| `/#/` | predajný web (`#ukazka`, `#co-dostanete`, `#ako`, `#cennik`, `#otazky`, `#dopyt` sú kotvy sekcií) |
| `/?z=…#/` | predajný web s pásom pre návštevu z e-mailu (nič sa neukladá) |
| `/ukazka` | krátky odkaz do e-mailov, presmeruje na `/?z=u#/demo/slubeny-termin` |
| `/#/podmienky` | podmienky pilotu (rovnaký obsah ako `docs/PODMIENKY_PILOTU.md`) |
| `/#/ochrana-udajov` | ochrana osobných údajov |
| `/#/demo` | prehľad troch situácií a stav pokusov |
| `/#/demo/slubeny-termin` | situácia 1: Sľúbený termín |
| `/#/demo/kusy-alebo-balenia` | situácia 2: Kusy alebo balenia |
| `/#/demo/zmena-adresy` | situácia 3: Zmena adresy na poslednú chvíľu |
| `/#/demo/prehlad` | „Čo uvidí vedúci“: prehľad tréningu na tlač alebo uloženie do PDF |

Adresy bez hash (`/demo`, `/demo/<situácia>`, `/cennik`, `/kontakt` …) presmeruje `public/404.html`.

## Štruktúra

```
index.html                  vstupná stránka (lang="sk"), popis, náhľad odkazu a JSON-LD verejného webu
public/404.html             stránka pre neznámu adresu, presmeruje krátke adresy na hash adresy
public/ukazka/index.html    krátka adresa /ukazka do e-mailov
public/og.png               obrázok náhľadu odkazu (npm run og)
public/img/                 snímky ukážky pre sekciu „Čo dostanete“ (scripts/snimky_webu.mjs)
public/favicon.*, apple-touch-icon.png, robots.txt, sitemap.xml, CNAME
src/main.tsx                štart Reactu (zapne pohyb, ak ho prehliadač a návštevník dovolia)
src/pohyb.ts                odhalenie prvkov pri scrollovaní (IntersectionObserver, raz, vypnuté pri reduced motion)
src/App.tsx                 výber stránky podľa trasy, rozloženie, hlavička a pätička
src/router.ts               parsovanie hash adries
src/vite-env.d.ts           konštanta __KLIENT__ (režim buildu známy pri preklade)
src/jsonld.test.ts          ceny v JSON-LD a popise index.html oproti src/config/znacka.ts
src/config/znacka.ts        názov služby, poskytovateľ (meno, telefón, IČO, sídlo, fotka), kontakt, balíčky a ceny
src/data/types.ts           dátový model (tréning, scenár, uzol, možnosť, kontrolný bod, schválenie)
src/data/demo/              verejná ukážka: index.ts, tri scenáre a test výpočtov
src/engine/pokus.ts         stav pokusu (výber, číselný vstup, návrat ku kroku) a vyhodnotenie
src/engine/validacia.ts     automatická validácia scenárov
src/demo/                   prehrávač: stav v pamäti, uzly, podklady, súhrn (verdikt ako pečiatka), prehľad tréningu; pohyb.ts pre reťaz následkov
src/web/                    predajný web, živá ukážka v hero (test mini_nahlad.test.ts), kontakt (kontakt.ts),
                            krátky dopyt (test dopyt_text.test.ts), podmienky, ochrana údajov
src/styles.css              tokeny, typografia, hlavička, tlačidlá a sekcie predajného webu
src/demo/demo.css           prehrávač tréningu, súhrn a tlač (používa tokeny zo styles.css)
scripts/validuj_scenare.ts  validácia z príkazového riadka
scripts/build_klient.mjs    build klientskeho tréningu z priečinka mimo repozitára a kontrola výstupu
scripts/podmienky_pdf.mjs   podmienky pilotu z docs/ do jednostranového PDF (vystupy/, mimo repozitára)
scripts/ikony.mjs           favicon.ico a apple-touch-icon.png z favicon.svg
scripts/og_obrazok.mjs      public/og.png z hero úvodnej stránky
scripts/snimky_webu.mjs     snímky ukážky do public/img/
scripts/nahlady.mjs         staršie snímky obrazovky do nahlady/ (mimo repozitára)
e2e/web.spec.ts             koncový test predajnej stránky (hero, chyby, kontakt, podmienky, skip link, mobil 360/390/414 px)
e2e/demo.spec.ts            koncový test ukážky (chybná vetva, oprava, súhrn, návrat, prehľad, mobil)
docs/                       dokumentácia (nižšie)
```

## Dokumentácia

- [docs/SCENARE.md](docs/SCENARE.md): dátový model, pravidlá troch scenárov, ako scenár upraviť alebo pridať, čo kontroluje validácia.
- [docs/PODMIENKY_PILOTU.md](docs/PODMIENKY_PILOTU.md): jednostranové podmienky pilotu pre klienta (čo dostane, čo dodá, postup, cena a platba, čo nie je v cene, dôvernosť). PDF na poslanie: `npm run podmienky`.
- [docs/NASADENIE.md](docs/NASADENIE.md): publikovanie verejného webu, údaje v `znacka.ts`, oddelenie interných klientskych tréningov.
- [docs/OVERENIE.md](docs/OVERENIE.md): vykonané kontroly, výsledky a známe obmedzenia.

## Rozhodnutia a predpoklady

- **Stack:** React 19, TypeScript 5.9, Vite 8 (statický výstup), Vitest 5, Playwright 1.63. Router je malý vlastný hash router bez závislostí, stav je obyčajný React context.
- **Vzhľad:** pracovný vzhľad dokladu: papierové pozadie, atramentový text, jeden zelený akcent pre akcie, červená len pre chybu a jej následok, tenké linky, polomery 6 až 12 px, takmer bez tieňov. Písmo IBM Plex Sans (`@fontsource-variable/ibm-plex-sans`) a pre čísla, kódy a štítky IBM Plex Mono (`@fontsource/ibm-plex-mono`), obe hostované lokálne. Hlavička na celú šírku, ikony `@phosphor-icons/react` len tam, kde nesú význam. Pohyb (26. 10. 2026) len cez `transform` a `opacity`, tokeny `--pohyb-*` a `--krivka-von` v `:root`: v hero séria pri načítaní (H1 a podtext stoja kvôli LCP), v živej ukážke odkrytie rezervácií a preškrtnutie „12 ks“ ako perom, odhalenie dokladov, snímok, liniek krokov a kariet pri scrollovaní, v ukážke verdikt ako pečiatka. Skrýva sa len pod triedou `pohyb` na `<html>`, preto bez JS, pri tlači a pri `prefers-reduced-motion` je všetko viditeľné. Hlavné písma sa pri builde prednačítajú (`vite.config.ts`), hero pri načítaní písma neposkočí.
- **Štruktúra predajného webu:** hero pre koho a sľub, vpravo živá ukážka, kde rezervácie a voľné kusy vidno až po voľbe; „Ktorá z týchto chýb sa u vás stala naposledy?“ (tri doklady s následkom a odkazom do ukážky) a komu sa to oplatí aj nie; čo dostanete (skutočné snímky ukážky zo `scripts/snimky_webu.mjs`); ako to prebieha s lehotami a platbou; cena; sekcia „Kto to robí“ (len keď je vyplnené meno); otázky; kontakt. Hlas je prvá osoba jednotného čísla.
- **Kontakt s najnižším prahom.** Hlavná akcia je „Napísať jednou vetou“: `mailto` s predvyplneným predmetom (`src/web/kontakt.ts`), vedľa adresa na skopírovanie a odkaz „Poslať odkaz vedúcemu“. Krátky formulár (len jedna povinná veta) je až na požiadanie a tiež len pripraví e-mail. Stránka nikdy nehlási „odoslané“.
- **Identita poskytovateľa** sa riadi poľami v `src/config/znacka.ts` (`poskytovatel`, `telefon`, `ico`, `sidlo`, `fotka`, `odpovedDo`). Prázdne pole sa nikde nezobrazí; po vyplnení sa ukáže sekcia „Kto to robí“, telefón v kontakte, údaje v pätičke a prevádzkovateľ v ochrane údajov.
- **Stav pokusu je len v pamäti stránky.** Výsledky sú len v otvorenej stránke a po jej obnovení zmiznú; nič sa neukladá ani neposiela. Nový človek si na konci súhrn vytlačí alebo uloží ako PDF a pošle ho vedúcemu. Meno pracovníka je len nepovinné pole na výtlačok.
- **Klientsky tréning neobsahuje predajný web.** Build s `TRENING_DIR` nastaví pri preklade `__KLIENT__` na `true`, takže predajné stránky, cenník a kontakt poskytovateľa sa do JS vôbec nedostanú. `scripts/build_klient.mjs` to po builde overí.
- **Scenáre sú dáta.** Každý scenár je jeden súbor v `src/data/demo/`, graf uzlov je acyklický; opakovanie a návrat ku kroku sú funkcie rozhrania, nie vetvy príbehu.
- **Kontrolné body** majú tri stavy: správne na prvý pokus, opravené po spätnej väzbe, nevyriešené. Nedotknutý bod je po skončení nevyriešený.
- **Modelové sumy** (120 €, 45 €, 65 €) sú viazané na konkrétne možnosti a zobrazujú sa len na postupe, ktorý k nim vedie. Návrat ku kroku ich odstráni, nič sa nezdvojí (testy `src/engine/pokus.test.ts`).
- **Ceny** sa uvádzajú len ako sumy, polovica pri objednávke a polovica pri odovzdaní, bez predplatného. Ceny v `index.html` (JSON-LD, popis) stráži test `src/jsonld.test.ts`. Daňový status sa na webe neuvádza (`dphPoznamka` ostáva prázdna).
- **Žiadne cudzie skripty, písma, cookies ani sledovanie.** Písma sú súčasťou buildu.
- **Na webe nie sú referencie, logá zákazníkov, počty používateľov ani percentá úspory**, lebo nič také zatiaľ neexistuje.

## Čo ešte chýba

Web beží na `https://chybynaskusku.online`. Zoznam polí s miestami v kóde je v `docs/NASADENIE.md`.

- meno, telefón, IČO a sídlo poskytovateľa (`src/config/znacka.ts`); kým sú prázdne, web ich nikde neukazuje,
- meranie návštevnosti bez cookies a skutočné odosielanie formulára (dnes sa dopyt posiela z e-mailu návštevníka).

Daňový status sa na webe zámerne neuvádza (`dphPoznamka` ostáva prázdna).
