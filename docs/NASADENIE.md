# Nasadenie

Dve úplne oddelené veci: **verejné demo s predajným webom** (jeden build, verejný hosting) a **interné
klientske tréningy** (každý vlastný build z priečinka mimo repozitára, chránené prostredie).

## 1. Verejné demo a predajný web

Výstup je čisto statický (`dist/`): `index.html`, jeden JS súbor, jeden CSS súbor, favicon. Nepotrebuje
databázu, backend ani API kľúče. Adresy sú hash adresy (`/#/demo/...`), takže build funguje z koreňa
domény aj z podpriečinka (`base: './'` vo `vite.config.ts`) a nepotrebuje presmerovania 404.

### Postup

1. Doplniť údaje v `src/config/znacka.ts` (pozri zoznam nižšie).
2. `npm run check` – typy, validácia scenárov, jednotkové testy, build.
3. `npm run test:e2e` – koncový test nad buildom.
4. Nahrať obsah `dist/` na hosting. Funguje na GitHub Pages, Cloudflare Pages, Hostingeri alebo
   ľubovoľnom serveri, ktorý servíruje statické súbory. Pri GitHub Pages stačí publikovať `dist/`
   (napr. GitHub Actions s krokom `npm ci && npm run build` a nasadením priečinka `dist`).
5. Po nasadení otvoriť web, prejsť jednu situáciu, otvoriť `#/demo/prehlad` a vyskúšať tlač.

### Čo doplniť pred publikovaním (zatiaľ zámerne prázdne)

| Údaj | Kde | Stav |
|---|---|---|
| Kontaktný e-mail na dopyty | `znacka.kontaktEmail` | chýba – formulár zatiaľ len pripraví text na skopírovanie; po doplnení sa ukáže tlačidlo „Otvoriť e-mail s dopytom“ a adresa v pätičke |
| Doména / adresa webu | `znacka.webAdresa` + hosting | chýba – nevymýšľa sa |
| Poznámka k DPH | `znacka.dphPoznamka` | chýba – nastaviť podľa skutočných fakturačných údajov (platca / neplatca); dovtedy sa pri cenách daňový status neuvádza |
| Fakturačné údaje poskytovateľa | do konkrétnej ponuky klientovi (mimo webu) | chýbajú |
| Text „Kontakt“ v pätičke | odvodí sa z `kontaktEmail` | automaticky |

Pri dopyte platí: „Dopyt bol odoslaný“ sa smie zobraziť jedine pri skutočnom odoslaní cez zapojenú
službu. Súčasná verzia žiadnu nemá, preto hovorí „Dopyt je pripravený. Odošlite ho zo svojho e-mailu.“
Ak má Alex dopyty zbierať automaticky, treba skutočný backend (napr. formulárová služba), nie ďalšie
`mailto:` – ľuďom, ktorí čítajú poštu v prehliadači, `mailto:` nič neotvorí, preto je hlavná cesta
kopírovanie textu.

### Čo sa publikuje a čo nie

- Publikuje sa len `dist/` z `src/data/demo` (vymyslená firma DEMO DISTRIBÚCIA).
- `treningy_klientov/`, `dist-klient*/`, `nahlady/`, `test-results/` sú v `.gitignore` a do verejného
  buildu ani repozitára sa nedostanú. Pred pushom do verejného repozitára skontrolovať `git status`.
- Web nenačítava cudzie skripty, písma ani cookies a hovorí to o sebe v pätičke. Analytika alebo widget
  by toto tvrdenie porušili – najprv prepísať pätičku.

## 2. Klientsky tréning (interný)

Klientsky obsah je dôverný. Nikdy nepatrí do `src/data/demo`, do verejného buildu ani do verejného
repozitára.

### Založenie

1. Vytvoriť priečinok `treningy_klientov/<firma>/` (je v `.gitignore`). Názov bez diakritiky a medzier.
2. Skopírovať doň `src/data/demo/index.ts` a súbory scenárov ako vzor. V `index.ts` nastaviť:
   - `rezim: 'klient'` – aplikácia potom zobrazuje len prehrávač (bez predajného webu, bez cenníka,
     bez dopytu), v hlavičke a pätičke je názov klienta;
   - `znacka: { nazovFirmy: 'Názov klienta', jeModelova: false }`;
   - `nazov`, `pozicia`, `scenare`, prípadne vlastné `upozornenie`.
3. Scenáre písať podľa `SCENARE.md` a `SABLONA_SCENARA.md`; v každom vyplniť `schvalenie` (stav
   `schvalene`, verzia pravidiel, referencia na schválený dokument, kto a kedy potvrdil).
4. Importy typov v klientskych súboroch smerujú relatívne na `../../src/data/types`.

### Build

```bash
npm run build:klient -- treningy_klientov/<firma>
```

Skript postupne spustí validáciu scenárov klienta, kontrolu typov a build s aliasom `@trening`
nasmerovaným na klientsky priečinok. Výstup je v `dist-klient/` (druhý argument zmení priečinok).
V PowerShelli sa to isté dá spustiť ručne:

```powershell
$env:TRENING_DIR = "treningy_klientov/<firma>"; $env:VYSTUP_DIR = "dist-klient"; npx vite build
```

### Nasadenie interného tréningu

- Použiť chránené prostredie klienta (intranet, prihlásenie) alebo hosting s kontrolou prístupu
  (napr. Cloudflare Access, HTTP autentifikácia na serveri, zdieľanie v internej sieti).
- **Tajná URL ani `noindex` obsah nechránia.** Nepovažovať ich za ochranu.
- Tréning nič neukladá a nič neposiela; výsledky ostávajú v prehliadači pracovníka. Ak by klient chcel
  centrálnu evidenciu výsledkov, je to ďalšia fáza (účty, databáza, ochrana osobných údajov) a mimo
  tejto verzie.
- Pri odovzdaní priložiť: build, zdrojové súbory scenárov, dátum a verziu scenárov, prehľad scenárov,
  návod (`SCENARE.md`, kapitola 3) a zoznam schválených pravidiel.

### Aktualizácia

Zmena obsahu = úprava súborov v `treningy_klientov/<firma>/`, zvýšenie `verzia`, nové `schvalenie`,
`npm run build:klient`, nové nasadenie. Staršie buildy klientovi nenechávať verejne dostupné.

## 3. Repozitár a automatické nasadenie

Verejný repozitár: `Apoliak7777/chyby-na-skusku` (vetva `main`). Každý push do `main` spustí
workflow `.github/workflows/pages.yml`, ktorý nainštaluje závislosti, spraví `npm run build`
(kontrola typov + Vite) a nasadí priečinok `dist/` na GitHub Pages. Kým nie je pripojená doména,
web beží na adrese `https://apoliak7777.github.io/chyby-na-skusku/`. Hash adresy a `base: './'`
zaručujú, že build funguje aj z tohto podpriečinka.

Pripojenie vlastnej domény (rozhodnutie 16. 9. 2026: `chybynaskusku.online`, kúpi sa na Hostingeri
spolu so schránkou `info@chybynaskusku.online`; kúpa je odložená, kým nepríde prvá platba z už
bežiacich biznisov):

1. V DNS domény (Hostinger → DNS / Name Servers) nastaviť:

   | Typ | Názov | Hodnota |
   |---|---|---|
   | A | @ | 185.199.108.153 |
   | A | @ | 185.199.109.153 |
   | A | @ | 185.199.110.153 |
   | A | @ | 185.199.111.153 |
   | CNAME | www | apoliak7777.github.io |

   Záznamy MX a TXT pre poštu (Hostinger) ostávajú bez zmeny; pošta zostáva v Hostingeri.
2. Do `public/CNAME` dať jeden riadok `chybynaskusku.online` a pushnúť (build ho skopíruje do `dist/`).
3. V nastaveniach repozitára (Settings → Pages → Custom domain) zadať `chybynaskusku.online`, počkať na
   overenie DNS a zapnúť „Enforce HTTPS“.
4. Do `src/config/znacka.ts` doplniť `kontaktEmail: 'info@chybynaskusku.online'` a
   `webAdresa: 'https://chybynaskusku.online'`, pridať stránku ochrany osobných údajov, pushnúť.
5. Otvoriť web na doméne aj na `www`, vyskúšať dopyt (tlačidlo „Otvoriť e-mail s dopytom“) a jednu situáciu.

Repozitár musí ostať bez klientskych priečinkov a bez tajných údajov; `.gitignore` to rieši
a `git status` pred pushom to potvrdí. Klientske tréningy sa nikdy nenasadzujú cez tento verejný
workflow – idú do chráneného prostredia klienta (kapitola 2).
