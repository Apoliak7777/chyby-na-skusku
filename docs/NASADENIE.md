# Nasadenie

Dve úplne oddelené veci: **verejný predajný web s ukážkou** (jeden build, verejný hosting) a **interné
klientske tréningy** (každý vlastný build z priečinka mimo repozitára, chránené prostredie).

## 1. Verejný web a ukážka

Výstup je čisto statický (`dist/`): `index.html`, JS a CSS, písma, ikony a technické súbory
(pozri nižšie). Nepotrebuje databázu, backend ani API kľúče. Adresy sú hash adresy (`/#/demo/...`),
takže build funguje z koreňa domény aj z podpriečinka (`base: './'` vo `vite.config.ts`). Krátke
adresy bez hash (`/ukazka`, `/demo`, `/cennik` …) riešia `public/ukazka/index.html` a `public/404.html`.

### Postup

1. Skontrolovať údaje v `src/config/znacka.ts` (pozri tabuľku nižšie).
2. `npm run check`: typy, validácia scenárov, jednotkové testy, build.
3. `npm run test:e2e`: čerstvý build a koncový test nad ním.
4. Pushnúť do `main`. Workflow (kapitola 3) web zostaví a nasadí. Výstup `dist/` funguje aj na
   Cloudflare Pages, Hostingeri alebo ľubovoľnom serveri, ktorý servíruje statické súbory.
5. Po nasadení otvoriť web, prejsť jednu situáciu, otvoriť `#/demo/prehlad` a vyskúšať tlač.

### Údaje v `src/config/znacka.ts`

| Údaj | Pole | Stav |
|---|---|---|
| Kontaktný e-mail na dopyty | `kontaktEmail` | vyplnený (`info@chybynaskusku.online`): adresa v pätičke, tlačidlo „Otvoriť e-mail s dopytom“ a odkazy `mailto` |
| Adresa webu | `webAdresa` | vyplnená (`https://chybynaskusku.online`) |
| Meno poskytovateľa | `poskytovatel` | zámerne prázdne: na webe sa meno neuvádza |
| Telefón | `telefon` | zámerne prázdny |
| IČO a sídlo | `ico`, `sidlo` | zámerne prázdne |
| Fotka | `fotka` | zámerne prázdna (ukázala by sa len spolu s menom) |
| Lehota odpovede | `odpovedDo` | zámerne prázdna (vyplniť, len ak naozaj platí) |
| Poznámka k DPH | `dphPoznamka` | zámerne prázdna: na webe sa daňový status neuvádza, ceny sú len sumy |
| Fakturačné údaje | do konkrétnej ponuky klientovi | mimo webu |

Prázdne pole sa na webe nikde neukáže. Po vyplnení mena sa zobrazí sekcia „Kto to robí“ a prevádzkovateľ
v ochrane údajov, telefón v kontakte a IČO so sídlom v pätičke.

Pri dopyte platí: „odoslané“ sa smie zobraziť jedine pri skutočnom odoslaní cez zapojenú službu.
Súčasná verzia žiadnu nemá. Hlavná akcia je „Napísať jednou vetou“ (`mailto` s predvyplneným predmetom);
krátky formulár na požiadanie po kliknutí na „Pripraviť e-mail“ ukáže „E-mail je pripravený. Odošlite
ho zo svojej schránky.“ a ponúkne „Otvoriť e-mail s dopytom“ aj „Skopírovať text“. Kopírovanie je pre
ľudí, ktorým `mailto:` nič neotvorí (pošta len v prehliadači). Ak sa majú dopyty zbierať automaticky,
treba skutočný backend (napr. formulárová služba), nie ďalšie `mailto:`.

### Čo sa publikuje a čo nie

- Publikuje sa len `dist/` zo `src/data/demo` (vymyslená firma DEMO DISTRIBÚCIA).
- `treningy_klientov/`, `dist-klient*/`, `nahlady/`, `vystupy/`, `test-results/` sú v `.gitignore` a do
  verejného buildu ani repozitára sa nedostanú. Pred pushom do verejného repozitára skontrolovať `git status`.
- Web nenačítava cudzie skripty, písma ani cookies a hovorí to o sebe v pätičke. Analytika alebo widget
  by toto tvrdenie porušili, preto treba najprv prepísať pätičku a ochranu údajov.

### Náhľad odkazu, vyhľadávače, presmerovania a ikony

| Súbor | Čo robí |
|---|---|
| `index.html` | titulok, popis, `canonical`, náhľad odkazu (`og:*`, `twitter:card`) a JSON-LD (`WebSite` a `Service` s ponukami 690, 1 900 a 490 €, bez hodnotení). Ceny stráži test `src/jsonld.test.ts` oproti `balicky` v `znacka.ts`. Blok medzi značkami `verejny web: zaciatok` a `koniec` klientsky build vynechá. |
| `public/og.png` | obrázok náhľadu odkazu 1200 × 630 px (Teams, WhatsApp, Outlook, LinkedIn). Vyrába ho `npm run og`. |
| `public/favicon.svg` | logo. Z neho `npm run ikony` vyrobí `favicon.ico` (32 a 48 px) a `apple-touch-icon.png` (180 px). Spustiť po každej zmene loga. |
| `public/img/` | snímky ukážky pre sekciu „Čo dostanete“. Vyrába ich `node scripts/snimky_webu.mjs` pri bežiacom `npm run preview`; po zmene ukážky spustiť znova. |
| `public/robots.txt`, `public/sitemap.xml` | indexovanie. Sitemap má len úvodnú stránku, lebo hash adresy nie sú samostatné stránky. Pri väčšej zmene webu prepísať `lastmod`. |
| `public/404.html` | GitHub Pages ju vráti pri neznámej adrese. `/demo` a `/ukazka` presmeruje na prvú situáciu, `/demo/<situácia>` a `/demo/prehlad` na rovnakú hash adresu `#/demo/…`, `/situacie` na prehľad situácií, `/cena` a `/cennik` na cenník, `/kontakt` a `/dopyt` na dopyt, `/ochrana-udajov` a `/podmienky` na tieto stránky. Parameter `?z=…` z adresy sa zachová. Inú adresu ukáže ako „Táto stránka neexistuje“ s odkazom na úvod a na ukážku. Nová krátka adresa sa pridáva do objektu `mapa` v skripte stránky. |
| `public/ukazka/index.html` | krátka adresa do e-mailov `chybynaskusku.online/ukazka`: vráti 200 a presmeruje na `/?z=u#/demo/slubeny-termin` (vlastný `?z=` z adresy sa zachová), bez JavaScriptu cez meta refresh a odkaz. Má `noindex`. |

**Nový `og.png` po zmene hero** (nadpis, podtext alebo živá ukážka):

```bash
npm run build
npm run preview    # v druhom okne, port 4177
npm run og         # zapíše public/og.png
```

Skript otvorí úvodnú stránku v okne 1200 × 630, skryje hlavičku, pás pre návštevu z e-mailu, tlačidlá,
cenu, odkaz pre vedúceho a popis pod ukážkou, pod text doplní adresu `chybynaskusku.online` a odfotí
nadznak, nadpis, podtext a živú ukážku. Keď je hero vyššie, vykreslí ho zmenšené. Iný server nastaví
premenná `NAHLAD_URL`, iný výstup `OG_VYSTUP` a ďalšie prvky na skrytie `OG_SKRYT=".trieda, .ina"`
(v PowerShelli `$env:NAHLAD_URL = "http://127.0.0.1:4177"`). Obrázok si pred pushom pozrieť. Siete si
náhľad pamätajú; starý obnoví napr. LinkedIn Post Inspector alebo Facebook Sharing Debugger.

## 2. Klientsky tréning (interný)

Klientsky obsah je dôverný. Nikdy nepatrí do `src/data/demo`, do verejného buildu ani do verejného
repozitára.

### Založenie

1. Vytvoriť priečinok `treningy_klientov/<firma>/` (je v `.gitignore`). Názov bez diakritiky a medzier.
2. Skopírovať doň `src/data/demo/index.ts` a súbory scenárov ako vzor. V `index.ts` nastaviť:
   - `rezim: 'klient'`: aplikácia potom zobrazuje len prehrávač (bez predajného webu, bez cenníka,
     bez dopytu), v hlavičke a pätičke je názov klienta;
   - `znacka: { nazovFirmy: 'Názov klienta', jeModelova: false }`;
   - `nazov`, `pozicia`, `scenare`, prípadne vlastné `upozornenie`.
3. Scenáre písať podľa `SCENARE.md`; v každom vyplniť `schvalenie` (stav `schvalene`, verzia pravidiel,
   referencia na schválený dokument, kto a kedy potvrdil).
4. Importy typov v klientskych súboroch smerujú relatívne na `../../src/data/types`.

### Build

```bash
npm run build:klient -- treningy_klientov/<firma>
```

Skript postupne spustí validáciu scenárov klienta, kontrolu typov a build s aliasom `@trening`
nasmerovaným na klientsky priečinok. Výstup je v `dist-klient/` (druhý argument zmení priečinok).

Pri nastavenom `TRENING_DIR` je konštanta `__KLIENT__` (`vite.config.ts`, deklarácia v
`src/vite-env.d.ts`) už pri preklade `true`. Predajný web, podmienky, ochrana údajov, cenník a kontakt
poskytovateľa sú potom mŕtvy kód a do JS sa nedostanú. Hlavička má vždy navigáciu tréningu (Situácie,
Čo uvidí vedúci), na úvodnej adrese je zoznam situácií.

Klientsky build má titulok podľa `nazov` tréningu a `noindex, nofollow`, nemá popis, náhľad odkazu,
`canonical` ani JSON-LD verejného webu a z `public/` dostane len ikony (bez `CNAME`, `robots.txt`,
`sitemap.xml`, `og.png`, `img/`, `404.html` a `ukazka/`). Skript na konci skontroluje `index.html`,
súbory aj `assets/*.js` (nesmie v nich byť doména, kontaktný e-mail, „Koľko to stojí“, „Podmienky pilotu“
ani „Toto bola vymyslená firma“) a pri nájdení skončí chybou. V PowerShelli sa samotný build dá spustiť
aj ručne (bez záverečnej kontroly):

```powershell
$env:TRENING_DIR = "treningy_klientov/<firma>"; $env:VYSTUP_DIR = "dist-klient"; npx vite build
```

### Nasadenie interného tréningu

- Použiť chránené prostredie klienta (intranet, prihlásenie) alebo hosting s kontrolou prístupu
  (napr. Cloudflare Access, HTTP autentifikácia na serveri, zdieľanie v internej sieti).
- **Tajná URL ani `noindex` obsah nechránia.** Nepovažovať ich za ochranu.
- Tréning nič neukladá ani neposiela. Výsledky sú len v otvorenej stránke a po jej obnovení zmiznú.
  Nový človek si na konci súhrn vytlačí alebo uloží ako PDF a pošle ho vedúcemu. Ak by klient chcel
  centrálnu evidenciu výsledkov, je to ďalšia fáza (účty, databáza, ochrana osobných údajov) a mimo
  tejto verzie.
- Pri odovzdaní priložiť: build, zdrojové súbory scenárov, dátum a verziu scenárov, prehľad scenárov,
  návod (`SCENARE.md`, kapitola 3) a zoznam schválených pravidiel.

### Aktualizácia

Zmena obsahu = úprava súborov v `treningy_klientov/<firma>/`, zvýšenie `verzia`, nové `schvalenie`,
`npm run build:klient`, nové nasadenie. Staršie buildy klientovi nenechávať verejne dostupné.

## 3. Repozitár a automatické nasadenie

Každý push do vetvy `main` spustí workflow `.github/workflows/pages.yml`: `npm ci`, `npm run validate`,
`npm test` a `npm run build` (kontrola typov a Vite). Ak niečo z toho zlyhá, nenasadí sa nič; inak sa
priečinok `dist/` nasadí na GitHub Pages. Web beží na vlastnej doméne `https://chybynaskusku.online`
s vynúteným HTTPS. Hash adresy a `base: './'` zaručujú, že build funguje aj z podpriečinka.

Nastavenie domény (stav, ktorý platí):

1. DNS domény (Hostinger → DNS / Name Servers):

   | Typ | Názov | Hodnota |
   |---|---|---|
   | A | @ | 185.199.108.153 |
   | A | @ | 185.199.109.153 |
   | A | @ | 185.199.110.153 |
   | A | @ | 185.199.111.153 |
   | CNAME | www | apoliak7777.github.io |

   Záznamy MX a TXT pre poštu ostávajú bez zmeny; pošta je v Hostingeri.
2. `public/CNAME` obsahuje jeden riadok `chybynaskusku.online` (build ho skopíruje do `dist/`).
3. V nastaveniach repozitára (Settings → Pages → Custom domain) je zadaná `chybynaskusku.online`
   a zapnuté „Enforce HTTPS“.

Po zmene DNS alebo domény otvoriť web na doméne aj na `www`, vyskúšať „Napísať jednou vetou“ a jednu
situáciu.

Repozitár musí ostať bez klientskych priečinkov a bez tajných údajov; `.gitignore` to rieši
a `git status` pred pushom to potvrdí. Klientske tréningy sa nikdy nenasadzujú cez tento verejný
workflow, idú do chráneného prostredia klienta (kapitola 2).
